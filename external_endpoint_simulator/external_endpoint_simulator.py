import random
import sys, os

# add the project root to sys.path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

from flask import Flask, request, jsonify
from backend.api.utils import CoordinateConverter

# Mapping for
"""
{
"records_path": "result.records", 
"external_id": "carpark_designation", 
"x_coord": "x", 
"y_coord": "y",
 "name": "carpark_name"
 }
 
 
{
"records_path": "items[0].carpark_data", 
"external_id": "carpark_number", 
"total_lots": "carpark_info[0].total_lots",
 "available_lots": "carpark_info[0].lots_available"
 }
"""

app = Flask(__name__)


@app.route('/ntu/get_carpark_info', methods=['GET','POST'])
def get_carpark_info():

    #Convert lat lng to x y
    x1,y1 = CoordinateConverter.convert_latlng_to_xy(1.346053,103.680779)
    x2,y2 = CoordinateConverter.convert_latlng_to_xy(1.343266,103.681582)

    data = {
        "result": {
            "records": [
                {
                    "carpark_designation": "A",
                    "x": x1,
                    "y": y1,
                    "carpark_name": "North Spine Carpark"
                },
                {
                    "carpark_designation": "B",
                    "x": x2,
                    "y": y2,
                    "carpark_name": "South Spine Carpark"
                }
            ]
        }
    }
    return jsonify(data)


@app.route('/ntu/get_carpark_availability', methods=['GET','POST'])
def get_carpark_availability():

    lots_available = random.randint(0,120)
    data = {
        "items": [
            {
                "carpark_data": [
                    {
                        "carpark_number": "A",
                        "carpark_info": [
                            {
                                "total_lots": 120,
                                "lots_available": lots_available
                            }
                        ]
                    },
                    {
                        "carpark_number": "B",
                        "carpark_info": [
                            {
                                "total_lots": 80,
                                "lots_available": 50
                            }
                        ]
                    }
                ]
            }
        ]
    }
    return jsonify(data)

if __name__ == '__main__':
    app.run(port=5001, debug=True)