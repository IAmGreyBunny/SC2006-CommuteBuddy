# test_simple.py - Create this file
import requests

def test_lta_api():
    API_KEY = "QmENf9GDT22jcv+l0VipIw=="
    BUS_STOP_CODE = "83139"
    
    url = "https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival"
    headers = {
        'AccountKey': API_KEY,
        'accept': 'application/json'
    }
    params = {'BusStopCode': BUS_STOP_CODE}
    
    print("🔍 Testing LTA API Directly...")
    print(f"API Key: {API_KEY}")
    print(f"Bus Stop: {BUS_STOP_CODE}")
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS! API is working!")
            print(f"Found {len(data.get('Services', []))} bus services")
            for service in data.get('Services', [])[:2]:  # Show first 2 services
                print(f"  - Service {service['ServiceNo']} ({service['Operator']})")
            return True
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return False
            
    except Exception as e:
        print(f"💥 Exception: {str(e)}")
        return False

if __name__ == "__main__":
    test_lta_api()