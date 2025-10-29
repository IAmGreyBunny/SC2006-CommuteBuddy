from pyproj import Transformer

# Constant transformer reused across imports
TRANSFORMER_3414_TO_4326 = Transformer.from_crs("EPSG:3414", "EPSG:4326", always_xy=True)
TRANSFORMER_4326_TO_3414 = Transformer.from_crs("EPSG:4326", "EPSG:3414", always_xy=True)

def convert_xy_to_latlng(x, y):
    if x is None or y is None:
        return None, None
    lng, lat = TRANSFORMER_3414_TO_4326.transform(x, y)
    return lat, lng

def convert_latlng_to_xy(lat,lng):
    if lat is None or lng is None:
        return None, None
    x, y = TRANSFORMER_4326_TO_3414.transform(lng, lat)
    return x, y