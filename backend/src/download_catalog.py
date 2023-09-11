import requests
from bs4 import BeautifulSoup
from datetime import datetime
import time
import json
import urllib
from natsort import natsorted
now = datetime.now()
catalog=[]
i = 1
def parseurl(url, detail=False):
    global i
    try:
        response = requests.get(url)
        r = response.json()
        gee_id = r["id"]
        print(f"{i}: {gee_id}")
        gee_title = r["title"]
        gee_type = r["gee:type"]
        gee_start = r["extent"]["temporal"]["interval"][0][0].split("T")[0]
        if not r["extent"]["temporal"]["interval"][0][1] == None:
            gee_end = r["extent"]["temporal"]["interval"][0][1].split("T")[0]
        else:
            gee_end = now.strftime("%Y-%m-%d")
        gee_start_year = gee_start.split("-")[0]
        gee_end_year = gee_end.split("-")[0]
        gee_provider = r["providers"][0]["name"]
        gee_tags = r["keywords"]
        gee_eobands = r["summaries"]["eo:bands"] if "eo:bands" in r["summaries"].keys() else []
        gee_bands = [x for x in gee_eobands if "gee:classes" in x.keys()][0] if len(gee_eobands) > 0 else []
        gee_classes = gee_bands["gee:classes"] if len(gee_bands) > 0 else []
                
        # Band information
        bands = {}
        if detail:
            try:
                gee_properties = r["gee:schema"]["properties"]
                gee_viz = r["gee:visualization"]
                bands = {
                    "bands": gee_bands,
                    "properties": gee_properties,
                    "example": gee_viz
                }
            except:
                pass
        else:
            if len(gee_bands) > 0:
                gee_band_val = [x["value"] for x in gee_classes if "value" in x.keys()]
                gee_band_desc = [x["description"] for x in gee_classes if "description" in x.keys()]
                gee_band_gsd = [x["gsd"] for x in gee_classes if "gsd" in x.keys()]
                gee_band_scale = [x["gee:scale"] for x in gee_classes if "gee:scale" in x.keys()]
                if len(gee_band_val) > 0: bands["values"] = gee_band_val
                if len(gee_band_desc) > 0: bands["description"] = gee_band_desc
                if len(gee_band_gsd) > 0: bands["gsd"] = gee_band_gsd
                if len(gee_band_scale) > 0: bands["scale"] = gee_band_scale
        asset = {
            "id": gee_id,
            "provider": gee_provider,
            "title": gee_title,
            "start_date": gee_start,
            "end_date": gee_end,
            "startyear": gee_start_year,
            "endyear": gee_end_year,
            "type": gee_type,
            "tags": ", ".join(gee_tags),
        }
        asset["bands"] = bands
        catalog.append(asset)
        i = i + 1
    except Exception as e:
        print(url)
        print(e)

asset_list = []

def yf(url):
    page = requests.get(url)
    if page.status_code == 200:
        features = [
            assets["href"]
            for assets in page.json()["links"]
            if assets["rel"] == "child"
        ]
        for feature in features:
            if not feature.endswith("catalog.json"):
                asset_list.append(feature)
            else:
                yf(feature)

yf(url="https://earthengine-stac.storage.googleapis.com/catalog/catalog.json")

item_list = natsorted(list(set(asset_list)))
try:
    for items in item_list:
        parseurl(items, detail=False)
except Exception as e:
    print(f"Failed for {items}")
    print(e)
finally:
    with open("gee_catalog.json", "w") as file:
        json.dump(catalog, file, indent=4, sort_keys=True)