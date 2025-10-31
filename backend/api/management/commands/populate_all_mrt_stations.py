# api/management/commands/populate_all_mrt_stations.py
from django.core.management.base import BaseCommand
from api.models import MRTStation, MRTLine

class Command(BaseCommand):
    help = 'Populate ALL MRT stations in Singapore'
    
    def handle(self, *args, **options):
        self.stdout.write('🚇 Populating MRT stations...')
        
        # Singapore MRT stations data
        mrt_stations = [
            # North South Line
            {'code': 'NS1', 'name': 'Jurong East', 'lat': 1.3330, 'lng': 103.7422, 'lines': ['NSL']},
            {'code': 'NS2', 'name': 'Bukit Batok', 'lat': 1.3490, 'lng': 103.7495, 'lines': ['NSL']},
            {'code': 'NS3', 'name': 'Bukit Gombak', 'lat': 1.3584, 'lng': 103.7515, 'lines': ['NSL']},
            {'code': 'NS4', 'name': 'Choa Chu Kang', 'lat': 1.3854, 'lng': 103.7444, 'lines': ['NSL']},
            {'code': 'NS5', 'name': 'Yew Tee', 'lat': 1.3974, 'lng': 103.7474, 'lines': ['NSL']},
            {'code': 'NS7', 'name': 'Kranji', 'lat': 1.4252, 'lng': 103.7620, 'lines': ['NSL']},
            {'code': 'NS8', 'name': 'Marsiling', 'lat': 1.4325, 'lng': 103.7740, 'lines': ['NSL']},
            {'code': 'NS9', 'name': 'Woodlands', 'lat': 1.4367, 'lng': 103.7865, 'lines': ['NSL']},
            {'code': 'NS10', 'name': 'Admiralty', 'lat': 1.4406, 'lng': 103.8012, 'lines': ['NSL']},
            {'code': 'NS11', 'name': 'Sembawang', 'lat': 1.4490, 'lng': 103.8200, 'lines': ['NSL']},
            {'code': 'NS12', 'name': 'Canberra', 'lat': 1.4431, 'lng': 103.8297, 'lines': ['NSL']},
            {'code': 'NS13', 'name': 'Yishun', 'lat': 1.4294, 'lng': 103.8350, 'lines': ['NSL']},
            {'code': 'NS14', 'name': 'Khatib', 'lat': 1.4173, 'lng': 103.8329, 'lines': ['NSL']},
            {'code': 'NS15', 'name': 'Yio Chu Kang', 'lat': 1.3818, 'lng': 103.8449, 'lines': ['NSL']},
            {'code': 'NS16', 'name': 'Ang Mo Kio', 'lat': 1.3699, 'lng': 103.8494, 'lines': ['NSL']},
            {'code': 'NS17', 'name': 'Bishan', 'lat': 1.3510, 'lng': 103.8482, 'lines': ['NSL']},
            {'code': 'NS18', 'name': 'Braddell', 'lat': 1.3404, 'lng': 103.8467, 'lines': ['NSL']},
            {'code': 'NS19', 'name': 'Toa Payoh', 'lat': 1.3326, 'lng': 103.8474, 'lines': ['NSL']},
            {'code': 'NS20', 'name': 'Novena', 'lat': 1.3204, 'lng': 103.8438, 'lines': ['NSL']},
            {'code': 'NS21', 'name': 'Newton', 'lat': 1.3128, 'lng': 103.8384, 'lines': ['NSL']},
            {'code': 'NS22', 'name': 'Orchard', 'lat': 1.3040, 'lng': 103.8320, 'lines': ['NSL']},
            {'code': 'NS23', 'name': 'Somerset', 'lat': 1.3003, 'lng': 103.8390, 'lines': ['NSL']},
            {'code': 'NS24', 'name': 'Dhoby Ghaut', 'lat': 1.2990, 'lng': 103.8452, 'lines': ['NSL', 'NEL', 'CCL']},
            {'code': 'NS25', 'name': 'City Hall', 'lat': 1.2934, 'lng': 103.8527, 'lines': ['NSL', 'EWL']},
            {'code': 'NS26', 'name': 'Raffles Place', 'lat': 1.2844, 'lng': 103.8512, 'lines': ['NSL', 'EWL']},
            {'code': 'NS27', 'name': 'Marina Bay', 'lat': 1.2766, 'lng': 103.8545, 'lines': ['NSL', 'TEL']}, 
            {'code': 'NS28', 'name': 'Marina South Pier', 'lat': 1.2710, 'lng': 103.8630, 'lines': ['NSL']},
            
            # East West Line
            {'code': 'EW1', 'name': 'Pasir Ris', 'lat': 1.3724, 'lng': 103.9495, 'lines': ['EWL']},
            {'code': 'EW2', 'name': 'Tampines', 'lat': 1.3534, 'lng': 103.9454, 'lines': ['EWL']},
            {'code': 'EW3', 'name': 'Simei', 'lat': 1.3434, 'lng': 103.9534, 'lines': ['EWL']},
            {'code': 'EW4', 'name': 'Tanah Merah', 'lat': 1.3273, 'lng': 103.9466, 'lines': ['EWL']},
            {'code': 'EW5', 'name': 'Bedok', 'lat': 1.3239, 'lng': 103.9273, 'lines': ['EWL']},
            {'code': 'EW6', 'name': 'Kembangan', 'lat': 1.3210, 'lng': 103.9129, 'lines': ['EWL']},
            {'code': 'EW7', 'name': 'Eunos', 'lat': 1.3197, 'lng': 103.9031, 'lines': ['EWL']},
            {'code': 'EW8', 'name': 'Paya Lebar', 'lat': 1.3176, 'lng': 103.8927, 'lines': ['EWL', 'CCL']},
            {'code': 'EW9', 'name': 'Aljunied', 'lat': 1.3164, 'lng': 103.8829, 'lines': ['EWL']},
            {'code': 'EW10', 'name': 'Kallang', 'lat': 1.3114, 'lng': 103.8712, 'lines': ['EWL']},
            {'code': 'EW11', 'name': 'Lavender', 'lat': 1.3074, 'lng': 103.8630, 'lines': ['EWL']},
            {'code': 'EW12', 'name': 'Bugis', 'lat': 1.3003, 'lng': 103.8558, 'lines': ['EWL', 'DTL']},
            {'code': 'EW13', 'name': 'City Hall', 'lat': 1.2934, 'lng': 103.8527, 'lines': ['EWL', 'NSL']},
            {'code': 'EW14', 'name': 'Raffles Place', 'lat': 1.2844, 'lng': 103.8512, 'lines': ['EWL', 'NSL']},
            {'code': 'EW15', 'name': 'Tanjong Pagar', 'lat': 1.2766, 'lng': 103.8456, 'lines': ['EWL']},
            {'code': 'EW16', 'name': 'Outram Park', 'lat': 1.2800, 'lng': 103.8390, 'lines': ['EWL', 'NEL']},
            {'code': 'EW17', 'name': 'Tiong Bahru', 'lat': 1.2862, 'lng': 103.8275, 'lines': ['EWL']},
            {'code': 'EW18', 'name': 'Redhill', 'lat': 1.2896, 'lng': 103.8167, 'lines': ['EWL']},
            {'code': 'EW19', 'name': 'Queenstown', 'lat': 1.2947, 'lng': 103.8058, 'lines': ['EWL']},
            {'code': 'EW20', 'name': 'Commonwealth', 'lat': 1.3025, 'lng': 103.7984, 'lines': ['EWL']},
            {'code': 'EW21', 'name': 'Buona Vista', 'lat': 1.3072, 'lng': 103.7900, 'lines': ['EWL', 'CCL']},
            {'code': 'EW22', 'name': 'Dover', 'lat': 1.3114, 'lng': 103.7785, 'lines': ['EWL']},
            {'code': 'EW23', 'name': 'Clementi', 'lat': 1.3150, 'lng': 103.7650, 'lines': ['EWL']},
            {'code': 'EW24', 'name': 'Jurong East', 'lat': 1.3330, 'lng': 103.7422, 'lines': ['EWL', 'NSL']},
            {'code': 'EW25', 'name': 'Chinese Garden', 'lat': 1.3425, 'lng': 103.7324, 'lines': ['EWL']},
            {'code': 'EW26', 'name': 'Lakeside', 'lat': 1.3445, 'lng': 103.7208, 'lines': ['EWL']},
            {'code': 'EW27', 'name': 'Boon Lay', 'lat': 1.3386, 'lng': 103.7060, 'lines': ['EWL']},
            {'code': 'EW28', 'name': 'Pioneer', 'lat': 1.3375, 'lng': 103.6970, 'lines': ['EWL']},
            {'code': 'EW29', 'name': 'Joo Koon', 'lat': 1.3276, 'lng': 103.6783, 'lines': ['EWL']},
            
            # North East Line
            {'code': 'NE1', 'name': 'HarbourFront', 'lat': 1.2653, 'lng': 103.8222, 'lines': ['NEL']},
            {'code': 'NE3', 'name': 'Outram Park', 'lat': 1.2800, 'lng': 103.8390, 'lines': ['NEL', 'EWL']},
            {'code': 'NE4', 'name': 'Chinatown', 'lat': 1.2846, 'lng': 103.8439, 'lines': ['NEL', 'DTL']},
            {'code': 'NE5', 'name': 'Clarke Quay', 'lat': 1.2886, 'lng': 103.8467, 'lines': ['NEL']},
            {'code': 'NE6', 'name': 'Dhoby Ghaut', 'lat': 1.2990, 'lng': 103.8452, 'lines': ['NEL', 'NSL', 'CCL']},
            {'code': 'NE7', 'name': 'Little India', 'lat': 1.3068, 'lng': 103.8493, 'lines': ['NEL', 'DTL']},
            {'code': 'NE8', 'name': 'Farrer Park', 'lat': 1.3124, 'lng': 103.8542, 'lines': ['NEL']},
            {'code': 'NE9', 'name': 'Boon Keng', 'lat': 1.3195, 'lng': 103.8617, 'lines': ['NEL']},
            {'code': 'NE10', 'name': 'Potong Pasir', 'lat': 1.3313, 'lng': 103.8693, 'lines': ['NEL']},
            {'code': 'NE11', 'name': 'Woodleigh', 'lat': 1.3391, 'lng': 103.8707, 'lines': ['NEL']},
            {'code': 'NE12', 'name': 'Serangoon', 'lat': 1.3496, 'lng': 103.8733, 'lines': ['NEL', 'CCL']},
            {'code': 'NE13', 'name': 'Kovan', 'lat': 1.3602, 'lng': 103.8853, 'lines': ['NEL']},
            {'code': 'NE14', 'name': 'Hougang', 'lat': 1.3715, 'lng': 103.8925, 'lines': ['NEL']},
            {'code': 'NE15', 'name': 'Buangkok', 'lat': 1.3825, 'lng': 103.8936, 'lines': ['NEL']},
            {'code': 'NE16', 'name': 'Sengkang', 'lat': 1.3915, 'lng': 103.8950, 'lines': ['NEL']},
            {'code': 'NE17', 'name': 'Punggol', 'lat': 1.4044, 'lng': 103.9024, 'lines': ['NEL']},
            
            # Circle Line
            {'code': 'CC1', 'name': 'Dhoby Ghaut', 'lat': 1.2990, 'lng': 103.8452, 'lines': ['CCL', 'NSL', 'NEL']},
            {'code': 'CC2', 'name': 'Bras Basah', 'lat': 1.2970, 'lng': 103.8505, 'lines': ['CCL']},
            {'code': 'CC3', 'name': 'Esplanade', 'lat': 1.2935, 'lng': 103.8552, 'lines': ['CCL']},
            {'code': 'CC4', 'name': 'Promenade', 'lat': 1.2928, 'lng': 103.8612, 'lines': ['CCL', 'DTL']},
            {'code': 'CC5', 'name': 'Nicoll Highway', 'lat': 1.2999, 'lng': 103.8637, 'lines': ['CCL']},
            {'code': 'CC6', 'name': 'Stadium', 'lat': 1.3028, 'lng': 103.8754, 'lines': ['CCL']},
            {'code': 'CC7', 'name': 'Mountbatten', 'lat': 1.3062, 'lng': 103.8826, 'lines': ['CCL']},
            {'code': 'CC8', 'name': 'Dakota', 'lat': 1.3085, 'lng': 103.8885, 'lines': ['CCL']},
            {'code': 'CC9', 'name': 'Paya Lebar', 'lat': 1.3176, 'lng': 103.8927, 'lines': ['CCL', 'EWL']},
            {'code': 'CC10', 'name': 'MacPherson', 'lat': 1.3265, 'lng': 103.8900, 'lines': ['CCL', 'DTL']},
            {'code': 'CC11', 'name': 'Tai Seng', 'lat': 1.3358, 'lng': 103.8878, 'lines': ['CCL']},
            {'code': 'CC12', 'name': 'Bartley', 'lat': 1.3425, 'lng': 103.8800, 'lines': ['CCL']},
            {'code': 'CC13', 'name': 'Serangoon', 'lat': 1.3496, 'lng': 103.8733, 'lines': ['CCL', 'NEL']},
            {'code': 'CC14', 'name': 'Lorong Chuan', 'lat': 1.3515, 'lng': 103.8643, 'lines': ['CCL']},
            {'code': 'CC15', 'name': 'Bishan', 'lat': 1.3510, 'lng': 103.8482, 'lines': ['CCL', 'NSL']},
            {'code': 'CC16', 'name': 'Marymount', 'lat': 1.3490, 'lng': 103.8395, 'lines': ['CCL']},
            {'code': 'CC17', 'name': 'Caldecott', 'lat': 1.3377, 'lng': 103.8395, 'lines': ['CCL']},
            {'code': 'CC19', 'name': 'Botanic Gardens', 'lat': 1.3226, 'lng': 103.8153, 'lines': ['CCL', 'DTL']},
            {'code': 'CC20', 'name': 'Farrer Road', 'lat': 1.3174, 'lng': 103.8074, 'lines': ['CCL']},
            {'code': 'CC21', 'name': 'Holland Village', 'lat': 1.3116, 'lng': 103.7962, 'lines': ['CCL']},
            {'code': 'CC22', 'name': 'Buona Vista', 'lat': 1.3072, 'lng': 103.7900, 'lines': ['CCL', 'EWL']},
            {'code': 'CC23', 'name': 'one-north', 'lat': 1.2996, 'lng': 103.7875, 'lines': ['CCL']},
            {'code': 'CC24', 'name': 'Kent Ridge', 'lat': 1.2935, 'lng': 103.7844, 'lines': ['CCL']},
            {'code': 'CC25', 'name': 'Haw Par Villa', 'lat': 1.2824, 'lng': 103.7819, 'lines': ['CCL']},
            {'code': 'CC26', 'name': 'Pasir Panjang', 'lat': 1.2761, 'lng': 103.7915, 'lines': ['CCL']},
            {'code': 'CC27', 'name': 'Labrador Park', 'lat': 1.2722, 'lng': 103.8028, 'lines': ['CCL']},
            {'code': 'CC28', 'name': 'Telok Blangah', 'lat': 1.2707, 'lng': 103.8097, 'lines': ['CCL']},
            {'code': 'CC29', 'name': 'HarbourFront', 'lat': 1.2653, 'lng': 103.8222, 'lines': ['CCL', 'NEL']},
            
            # Downtown Line
            {'code': 'DT1', 'name': 'Bukit Panjang', 'lat': 1.3784, 'lng': 103.7624, 'lines': ['DTL']},
            {'code': 'DT2', 'name': 'Cashew', 'lat': 1.3693, 'lng': 103.7647, 'lines': ['DTL']},
            {'code': 'DT3', 'name': 'Hillview', 'lat': 1.3620, 'lng': 103.7674, 'lines': ['DTL']},
            {'code': 'DT5', 'name': 'Beauty World', 'lat': 1.3412, 'lng': 103.7757, 'lines': ['DTL']},
            {'code': 'DT6', 'name': 'King Albert Park', 'lat': 1.3353, 'lng': 103.7830, 'lines': ['DTL']},
            {'code': 'DT7', 'name': 'Sixth Avenue', 'lat': 1.3306, 'lng': 103.7978, 'lines': ['DTL']},
            {'code': 'DT8', 'name': 'Tan Kah Kee', 'lat': 1.3259, 'lng': 103.8071, 'lines': ['DTL']},
            {'code': 'DT9', 'name': 'Botanic Gardens', 'lat': 1.3226, 'lng': 103.8153, 'lines': ['DTL', 'CCL']},
            {'code': 'DT10', 'name': 'Stevens', 'lat': 1.3200, 'lng': 103.8258, 'lines': ['DTL']},
            {'code': 'DT11', 'name': 'Newton', 'lat': 1.3128, 'lng': 103.8384, 'lines': ['DTL', 'NSL']},
            {'code': 'DT12', 'name': 'Little India', 'lat': 1.3068, 'lng': 103.8493, 'lines': ['DTL', 'NEL']},
            {'code': 'DT13', 'name': 'Rochor', 'lat': 1.3039, 'lng': 103.8525, 'lines': ['DTL']},
            {'code': 'DT14', 'name': 'Bugis', 'lat': 1.3003, 'lng': 103.8558, 'lines': ['DTL', 'EWL']},
            {'code': 'DT15', 'name': 'Promenade', 'lat': 1.2928, 'lng': 103.8612, 'lines': ['DTL', 'CCL']},
            {'code': 'DT16', 'name': 'Bayfront', 'lat': 1.2830, 'lng': 103.8592, 'lines': ['DTL', 'CCL']},
            {'code': 'DT17', 'name': 'Downtown', 'lat': 1.2794, 'lng': 103.8531, 'lines': ['DTL']},
            {'code': 'DT18', 'name': 'Telok Ayer', 'lat': 1.2822, 'lng': 103.8486, 'lines': ['DTL']},
            {'code': 'DT19', 'name': 'Chinatown', 'lat': 1.2846, 'lng': 103.8439, 'lines': ['DTL', 'NEL']},
            {'code': 'DT20', 'name': 'Fort Canning', 'lat': 1.2924, 'lng': 103.8445, 'lines': ['DTL']},
            {'code': 'DT21', 'name': 'Bencoolen', 'lat': 1.2985, 'lng': 103.8502, 'lines': ['DTL']},
            {'code': 'DT22', 'name': 'Jalan Besar', 'lat': 1.3052, 'lng': 103.8552, 'lines': ['DTL']},
            {'code': 'DT23', 'name': 'Bendemeer', 'lat': 1.3135, 'lng': 103.8628, 'lines': ['DTL']},
            {'code': 'DT24', 'name': 'Geylang Bahru', 'lat': 1.3214, 'lng': 103.8713, 'lines': ['DTL']},
            {'code': 'DT25', 'name': 'Mattar', 'lat': 1.3270, 'lng': 103.8828, 'lines': ['DTL']},
            {'code': 'DT26', 'name': 'MacPherson', 'lat': 1.3265, 'lng': 103.8900, 'lines': ['DTL', 'CCL']},
            {'code': 'DT27', 'name': 'Ubi', 'lat': 1.3299, 'lng': 103.8995, 'lines': ['DTL']},
            {'code': 'DT28', 'name': 'Kaki Bukit', 'lat': 1.3350, 'lng': 103.9080, 'lines': ['DTL']},
            {'code': 'DT29', 'name': 'Bedok North', 'lat': 1.3345, 'lng': 103.9175, 'lines': ['DTL']},
            {'code': 'DT30', 'name': 'Bedok Reservoir', 'lat': 1.3362, 'lng': 103.9315, 'lines': ['DTL']},
            {'code': 'DT31', 'name': 'Tampines West', 'lat': 1.3455, 'lng': 103.9380, 'lines': ['DTL']},
            {'code': 'DT32', 'name': 'Tampines', 'lat': 1.3534, 'lng': 103.9454, 'lines': ['DTL', 'EWL']},
            {'code': 'DT33', 'name': 'Tampines East', 'lat': 1.3560, 'lng': 103.9545, 'lines': ['DTL']},
            {'code': 'DT34', 'name': 'Upper Changi', 'lat': 1.3420, 'lng': 103.9610, 'lines': ['DTL']},
            {'code': 'DT35', 'name': 'Expo', 'lat': 1.3345, 'lng': 103.9615, 'lines': ['DTL']},

            # Thomson-East Coast Line (TEL)
            {'code': 'TE1', 'name': 'Woodlands North', 'lat': 1.4480, 'lng': 103.7860, 'lines': ['TEL']},
            {'code': 'TE2', 'name': 'Woodlands', 'lat': 1.4367, 'lng': 103.7865, 'lines': ['TEL', 'NSL']},
            {'code': 'TE3', 'name': 'Woodlands South', 'lat': 1.4270, 'lng': 103.7900, 'lines': ['TEL']},
            {'code': 'TE4', 'name': 'Springleaf', 'lat': 1.3978, 'lng': 103.8178, 'lines': ['TEL']},
            {'code': 'TE5', 'name': 'Lentor', 'lat': 1.3847, 'lng': 103.8358, 'lines': ['TEL']},
            {'code': 'TE6', 'name': 'Mayflower', 'lat': 1.3722, 'lng': 103.8383, 'lines': ['TEL']},
            {'code': 'TE7', 'name': 'Bright Hill', 'lat': 1.3631, 'lng': 103.8328, 'lines': ['TEL']},
            {'code': 'TE8', 'name': 'Upper Thomson', 'lat': 1.3542, 'lng': 103.8322, 'lines': ['TEL']},
            {'code': 'TE9', 'name': 'Caldecott', 'lat': 1.3377, 'lng': 103.8395, 'lines': ['TEL', 'CCL']},
            {'code': 'TE10', 'name': 'Mount Pleasant', 'lat': 1.3264, 'lng': 103.8392, 'lines': ['TEL']},
            {'code': 'TE11', 'name': 'Stevens', 'lat': 1.3200, 'lng': 103.8258, 'lines': ['TEL', 'DTL']},
            {'code': 'TE12', 'name': 'Napier', 'lat': 1.3069, 'lng': 103.8161, 'lines': ['TEL']},
            {'code': 'TE13', 'name': 'Orchard Boulevard', 'lat': 1.3039, 'lng': 103.8236, 'lines': ['TEL']},
            {'code': 'TE14', 'name': 'Orchard', 'lat': 1.3040, 'lng': 103.8320, 'lines': ['TEL', 'NSL']},
            {'code': 'TE15', 'name': 'Great World', 'lat': 1.2931, 'lng': 103.8331, 'lines': ['TEL']},
            {'code': 'TE16', 'name': 'Havelock', 'lat': 1.2892, 'lng': 103.8328, 'lines': ['TEL']},
            {'code': 'TE17', 'name': 'Outram Park', 'lat': 1.2800, 'lng': 103.8390, 'lines': ['TEL', 'EWL', 'NEL']},
            {'code': 'TE18', 'name': 'Maxwell', 'lat': 1.2797, 'lng': 103.8450, 'lines': ['TEL']},
            {'code': 'TE19', 'name': 'Shenton Way', 'lat': 1.2764, 'lng': 103.8492, 'lines': ['TEL']},
            {'code': 'TE20', 'name': 'Marina Bay', 'lat': 1.2766, 'lng': 103.8545, 'lines': ['TEL', 'NSL']},
            {'code': 'TE21', 'name': 'Marina South', 'lat': 1.2725, 'lng': 103.8636, 'lines': ['TEL']},
            {'code': 'TE22', 'name': 'Gardens by the Bay', 'lat': 1.2817, 'lng': 103.8650, 'lines': ['TEL']},

            {'code': 'TE23', 'name': 'Tanjong Rhu', 'lat': 1.2950, 'lng': 103.8730, 'lines': ['TEL']},
            {'code': 'TE24', 'name': 'Katong Park', 'lat': 1.2958, 'lng': 103.8828, 'lines': ['TEL']},
            {'code': 'TE25', 'name': 'Tanjong Katong', 'lat': 1.3003, 'lng': 103.8931, 'lines': ['TEL']},
            {'code': 'TE26', 'name': 'Marine Parade', 'lat': 1.3031, 'lng': 103.9056, 'lines': ['TEL']},
            {'code': 'TE27', 'name': 'Marine Terrace', 'lat': 1.3092, 'lng': 103.9150, 'lines': ['TEL']},
            {'code': 'TE28', 'name': 'Siglap', 'lat': 1.3142, 'lng': 103.9242, 'lines': ['TEL']},
            {'code': 'TE29', 'name': 'Bayshore', 'lat': 1.3192, 'lng': 103.9342, 'lines': ['TEL']},
            {'code': 'TE30', 'name': 'Bedok South', 'lat': 1.3208, 'lng': 103.9464, 'lines': ['TEL']},
            {'code': 'TE31', 'name': 'Sungei Bedok', 'lat': 1.3258, 'lng': 103.9564, 'lines': ['TEL', 'DTL']},
        

        ]
        
        created_count = 0
        for station_data in mrt_stations:
            # Get or create the station
            station, created = MRTStation.objects.get_or_create(
                station_code=station_data['code'],
                defaults={
                    'name': station_data['name'],
                    'latitude': station_data['lat'],
                    'longitude': station_data['lng'],
                }
            )
            
            # Add MRT lines
            for line_code in station_data['lines']:
                try:
                    line = MRTLine.objects.get(line_code=line_code)
                    station.lines.add(line)
                except MRTLine.DoesNotExist:
                    self.stdout.write(f'⚠️  MRT Line {line_code} not found for {station_data["name"]}')
            
            if created:
                created_count += 1
                self.stdout.write(f'✅ Created: {station_data["name"]} ({station_data["code"]})')
        
        self.stdout.write(
            self.style.SUCCESS(f'🎉 Created {created_count} new MRT stations!')
        )
        
        # Final count
        total_stations = MRTStation.objects.count()
        self.stdout.write(f'📊 Total MRT stations in database: {total_stations}')