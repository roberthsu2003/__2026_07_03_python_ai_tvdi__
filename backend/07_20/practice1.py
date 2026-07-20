import requests
from requests import Response,JSONDecodeError,HTTPError
from pydantic import BaseModel, TypeAdapter
from pprint import pprint

class CameraPosition(BaseModel):
    year:int
    bureau:str
    unit:str
    location:str

url = 'https://data.ntpc.gov.tw/api/datasets/1b72abe8-8862-4130-aeb8-178c1240e6c4/json?page=0&size=1000'


def main():
    try:
        r:Response = requests.request(method='GET',url=url)
        r.raise_for_status()
        data:list[dict] = r.json()
        adapter = TypeAdapter(list[CameraPosition])
        list_position:list[CameraPosition] = adapter.validate_python(data)
        pprint(list_position)
    except HTTPError as e:
        print(f"web api目前有問題:{e}")
    except JSONDecodeError as e:
        print(f"json格式有錯:{e}")
    except Exception as e:
        print(f"發生錯誤:{e}")

if __name__ == "__main__":
    main()