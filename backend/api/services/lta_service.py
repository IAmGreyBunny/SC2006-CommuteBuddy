# # api/services/lta_service.py
# import requests
# from django.conf import settings
# from django.core.cache import cache
# import datetime

# class LTADataService:
#     def __init__(self):
#         self.api_key = "QmENf9GDT22jcv+l0VipIw=="  # Your working API key
#         self.base_url = "https://datamall2.mytransport.sg/ltaodataservice"
#         self.headers = {
#             'AccountKey': self.api_key,
#             'accept': 'application/json'
#         }
    
#     def get_bus_arrival(self, bus_stop_code):
#         """Get real-time bus arrivals from LTA API"""
#         cache_key = f"bus_arrival_{bus_stop_code}"
#         cached_data = cache.get(cache_key)
        
#         if cached_data:
#             return {'success': True, 'data': cached_data, 'cached': True}
        
#         params = {'BusStopCode': bus_stop_code}
#         url = f"{self.base_url}/v3/BusArrival"
        
#         try:
#             response = requests.get(url, headers=self.headers, params=params, timeout=10)
            
#             if response.status_code == 200:
#                 data = response.json()
#                 cache.set(cache_key, data, timeout=20)  # Cache for 20 seconds
#                 return {'success': True, 'data': data}
#             else:
#                 return {
#                     'success': False, 
#                     'error': f'HTTP Error {response.status_code}',
#                     'status_code': response.status_code
#                 }
                
#         except Exception as e:
#             return {'success': False, 'error': str(e)}
        

# api/services/lta_service.py
import requests
from django.conf import settings
from django.core.cache import cache
import datetime
import logging

logger = logging.getLogger(__name__)

class LTADataService:
    def __init__(self):
        self.api_key = "QmENf9GDT22jcv+l0VipIw=="
        self.base_url = "https://datamall2.mytransport.sg/ltaodataservice"
        self.headers = {
            'AccountKey': self.api_key,
            'accept': 'application/json'
        }
    
    def get_bus_arrival(self, bus_stop_code, service_no=None):
        """Get real-time bus arrivals from LTA API"""
        cache_key = f"bus_arrival_{bus_stop_code}_{service_no if service_no else 'all'}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            logger.info(f"Returning cached data for {bus_stop_code}")
            return {'success': True, 'data': cached_data, 'cached': True}
        
        params = {'BusStopCode': bus_stop_code}
        if service_no:
            params['ServiceNo'] = service_no
            
        url = f"{self.base_url}/v3/BusArrival"
        
        try:
            response = requests.get(url, headers=self.headers, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                cache.set(cache_key, data, timeout=20)
                logger.info(f"Successfully fetched data for bus stop {bus_stop_code}")
                return {'success': True, 'data': data, 'cached': False}
            else:
                error_msg = f'HTTP Error {response.status_code}: {response.text}'
                logger.error(error_msg)
                return {
                    'success': False, 
                    'error': error_msg,
                    'status_code': response.status_code
                }
                
        except requests.exceptions.Timeout:
            error_msg = "LTA API timeout - service may be slow"
            logger.error(error_msg)
            return {'success': False, 'error': error_msg}
        except requests.exceptions.ConnectionError:
            error_msg = "Cannot connect to LTA API - check internet connection"
            logger.error(error_msg)
            return {'success': False, 'error': error_msg}
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(error_msg)
            return {'success': False, 'error': error_msg}
    
    def process_bus_arrival_data(self, raw_data):
        """
        Process raw LTA API data into a more user-friendly format
        """
        if not raw_data or 'Services' not in raw_data:
            return []
        
        processed_services = []
        
        for service in raw_data['Services']:
            processed_buses = []
            
            # Process NextBus, NextBus2, NextBus3
            for bus_key in ['NextBus', 'NextBus2', 'NextBus3']:
                bus_data = service.get(bus_key, {})
                
                if bus_data and bus_data.get('EstimatedArrival'):
                    # Calculate waiting time in minutes
                    waiting_time = self._calculate_waiting_time(bus_data.get('EstimatedArrival', ''))
                    
                    processed_bus = {
                        'arrival_sequence': bus_key.replace('NextBus', ''),
                        'service_no': service['ServiceNo'],
                        'operator': service['Operator'],
                        'origin_code': bus_data.get('OriginCode', ''),
                        'destination_code': bus_data.get('DestinationCode', ''),
                        'estimated_arrival': bus_data.get('EstimatedArrival', ''),
                        'waiting_time': waiting_time,
                        'is_monitored': bus_data.get('Monitored', 0) == 1,
                        'latitude': bus_data.get('Latitude', 0),
                        'longitude': bus_data.get('Longitude', 0),
                        'visit_number': bus_data.get('VisitNumber', ''),
                        'load': bus_data.get('Load', ''),
                        'load_display': self._get_load_display(bus_data.get('Load', '')),
                        'is_wheelchair_accessible': bus_data.get('Feature') == 'WAB',
                        'vehicle_type': bus_data.get('Type', ''),
                        'vehicle_type_display': self._get_vehicle_type_display(bus_data.get('Type', ''))
                    }
                    processed_buses.append(processed_bus)
            
            processed_services.append({
                'service_no': service['ServiceNo'],
                'operator': service['Operator'],
                'operator_name': self._get_operator_name(service['Operator']),
                'buses': processed_buses
            })
        
        return processed_services
    
    def _calculate_waiting_time(self, estimated_arrival_str):
        """Calculate waiting time in minutes from estimated arrival string"""
        if not estimated_arrival_str:
            return None
        
        try:
            # Parse the arrival time (format: 2024-08-14T16:41:48+08:00)
            arrival_time = datetime.datetime.fromisoformat(estimated_arrival_str.replace('Z', '+00:00'))
            current_time = datetime.datetime.now(arrival_time.tzinfo)
            
            # Calculate difference in minutes
            time_diff = arrival_time - current_time
            minutes = int(time_diff.total_seconds() / 60)
            
            # Apply LTA rounding rules (round down to nearest minute)
            return max(0, minutes)
            
        except (ValueError, TypeError):
            return None
    
    def _get_load_display(self, load_code):
        """Convert load code to display text"""
        load_mapping = {
            'SEA': 'Seats Available',
            'SDA': 'Standing Available', 
            'LSD': 'Limited Standing'
        }
        return load_mapping.get(load_code, 'Unknown')
    
    def _get_vehicle_type_display(self, type_code):
        """Convert vehicle type code to display text"""
        type_mapping = {
            'SD': 'Single Deck',
            'DD': 'Double Deck',
            'BD': 'Bendy'
        }
        return type_mapping.get(type_code, 'Unknown')
    
    def _get_operator_name(self, operator_code):
        """Convert operator code to full name"""
        operator_mapping = {
            'SBST': 'SBS Transit',
            'SMRT': 'SMRT Corporation',
            'TTS': 'Tower Transit Singapore',
            'GAS': 'Go Ahead Singapore'
        }
        return operator_mapping.get(operator_code, 'Unknown')
    
    def get_all_bus_stops(self):
        """Get all bus stops from LTA API (for database population)"""
        all_bus_stops = []
        skip = 0
        batch_size = 500
        
        while True:
            url = f"{self.base_url}/BusStops"
            params = {'$skip': skip}
            
            try:
                response = requests.get(url, headers=self.headers, params=params, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    bus_stops = data.get('value', [])
                    
                    if not bus_stops:
                        break  # No more data
                        
                    all_bus_stops.extend(bus_stops)
                    skip += batch_size
                    
                    # Safety limit
                    if skip > 10000:
                        break
                else:
                    return {
                        'success': False, 
                        'error': f'HTTP Error {response.status_code}',
                        'status_code': response.status_code
                    }
                    
            except Exception as e:
                return {'success': False, 'error': str(e)}
        
        return {'success': True, 'data': all_bus_stops}
    
    def get_bus_routes(self):
        """Get all bus routes from LTA API"""
        return self._make_paginated_call("BusRoutes")
    
    def get_bus_services(self):
        """Get all bus services from LTA API"""
        return self._make_paginated_call("BusServices")
    
    def _make_paginated_call(self, endpoint):
        """Helper method for paginated API calls"""
        all_data = []
        skip = 0
        batch_size = 500
        
        while True:
            url = f"{self.base_url}/{endpoint}"
            params = {'$skip': skip}
            
            try:
                response = requests.get(url, headers=self.headers, params=params, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    items = data.get('value', [])
                    
                    if not items:
                        break
                        
                    all_data.extend(items)
                    skip += batch_size
                    
                    if skip > 10000:
                        break
                else:
                    return {
                        'success': False, 
                        'error': f'HTTP Error {response.status_code}',
                        'status_code': response.status_code
                    }
                    
            except Exception as e:
                return {'success': False, 'error': str(e)}
        
        return {'success': True, 'data': all_data}
    
    def get_train_service_alerts(self):
        """Get MRT service disruptions"""
        url = f"{self.base_url}/TrainServiceAlerts"
        
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                return {'success': True, 'data': response.json()}
            else:
                return {
                    'success': False, 
                    'error': f'HTTP Error {response.status_code}',
                    'status_code': response.status_code
                }
                
        except Exception as e:
            return {'success': False, 'error': str(e)}