import os
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field, field_validator, ConfigDict

app = FastAPI(title="AQI 空氣品質監測系統")

JSON_FILE_PATH = '空氣品質aqi.json'

class SiteAQI(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    site_name: str = Field(validation_alias="sitename")
    county: str = Field(validation_alias="county")
    aqi: int
    status: str = Field(validation_alias="status")
    pm25: float = Field(validation_alias='pm2.5')

    @field_validator("pm25", mode="before")
    @classmethod
    def whitespace_to_zero(cls, value):
        if value == '':
            return '0.0'
        return value

class RecordsResponse(BaseModel):
    success: bool = True
    count: int
    records: list[SiteAQI]

@app.get(
    "/aqi/records",
    response_model=RecordsResponse,
    status_code=status.HTTP_200_OK,
    summary="讀取伺服器預置 AQI JSON 檔案"
)
def get_aqi_records():
    if not os.path.exists(JSON_FILE_PATH):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="伺服器上找不到指定的 JSON 檔案：{JSON_FILE_PATH}"
        )
    
    try:
        with open(JSON_FILE_PATH, mode='r', encoding='utf-8') as file:
            json_str = file.read()

            class RecordsParser(BaseModel):
                records: list[SiteAQI]
        
            parsed_data = RecordsParser.model_validate_json(json_str)

            return RecordsResponse(
                count=len(parsed_data.records),
                records=parsed_data.records
            )
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"伺服器讀取或解析 JSON 時發生錯誤: {str(e)}"
        )