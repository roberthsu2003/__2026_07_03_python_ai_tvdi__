import csv
import os
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field, computed_field, ConfigDict

app = FastAPI(title="學生分數管理系統")

CSV_FILE_PATH = "學生分數.csv"

class Student(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name:str = Field(validation_alias="姓名")
    chinese: int = Field(validation_alias="科目1")
    english: int = Field(validation_alias="科目2")
    math: int = Field(validation_alias="科目3")
    geography: int = Field(validation_alias="科目4")
    history: int = Field(validation_alias="科目5")
    social: int = Field(validation_alias="科目6")
    morality: int = Field(validation_alias="科目7")

    @computed_field
    @property
    def total_score(self) -> int:
        return (
            self.chinese
            + self.english
            + self.math
            + self.geography
            + self.history
            + self.social
            + self.morality
        )
    
class ScoreResponse(BaseModel):
    success: bool = True
    count: int
    students:list[Student]

@app.get(
    "/students/scores",
    response_model=ScoreResponse,
    status_code=status.HTTP_200_OK,
    summary="讀取伺服器預置 CSV 並計算分數"
)
def get_student_scores():
    if not os.path.exists(CSV_FILE_PATH):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="伺服器上找不到配置的 CSV 檔案：{CSV_FILE_PATH}"
        )
    try:
        students_list = []
        with open(CSV_FILE_PATH, encoding="utf-8-sig") as csvfile:
            reader = csv.DictReader(csvfile)
            for index, row in enumerate(reader, start=1):
                try:
                    student = Student.model_validate(row)
                    students_list.append(student)
                except Exception as val_error:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                        detail=f"CSV 檔案第 {index} 行資料驗證錯誤: {str(val_error)}"
                    )
        
        return ScoreResponse(
            count=len(students_list),
            students=students_list
        )
    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"伺服器讀取或解析 CSV 時發生錯誤: {str(e)}"
        )
    
    