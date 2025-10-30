from pyproj import Transformer

# Constant transformer reused across imports
TRANSFORMER_3414_TO_4326 = Transformer.from_crs("EPSG:3414", "EPSG:4326", always_xy=True)

def convert_xy_to_latlng(x, y):
    """Convert SVY21 (EPSG:3414) coordinates to WGS84 (EPSG:4326) latitude/longitude."""
    if x is None or y is None:
        return None, None
    lng, lat = TRANSFORMER_3414_TO_4326.transform(x, y)
    return lat, lng