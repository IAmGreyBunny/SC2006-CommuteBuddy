# 2006-SCS7-46

# Demo Video
[![Demo Video](https://img.youtube.com/vi/lZpMEbgT3vM/0.jpg)]([www.youtube.com](https://www.youtube.com/watch?v=lZpMEbgT3vM))

# Links to various Documents
## Google Docs
Google Docs (Report + Drafts):<br> 
https://docs.google.com/document/d/1Ve0CPX9tYPB2B4o90x7M6guuX3ua0pOJDgqQ9RTlEIo/edit?tab=t.0 

## Figma
Figma (UI Mockup):<br> 
[Figma (View Only Perms)](https://www.figma.com/design/qKmWWo74m66K8L42Pw9kpm/Commute-Buddy?node-id=0-1&t=COU5mOtSAd9tNZP0-1)

## LucidChart
LucidChart (Diagrams) - Use NTU account for more shapes:<br> 
[LucidChart Link (Comment Perms)](https://lucid.app/lucidchart/c9880752-3e24-471a-b890-1d5c1511ab12/edit?viewport_loc=-1148%2C-315%2C5800%2C2716%2C0_0&invitationId=inv_a10b52ab-719f-4519-bcb5-e85d145eb394)

## Code
Github (Code):<br> 
[Github Repo](https://github.com/softwarelab3/2006-SCS7-46)




# Project Setup Guide
## Obtaining Files
```
git clone https://github.com/softwarelab3/2006-SCS7-46
```

## Virtual Environment
Recommended to set up a virtual environment in order to isolate project dependencies from other projects, virtual environment is not tracked in this repository
```
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
```

## Python Packages
```
pip install -r requirements.txt
```
**Note: Make sure to be in your virtual environment before installing packages if you plan on using virtual environment**

## Docker Setup
The project relies on [docker](https://www.docker.com/products/docker-desktop/) image to run redis, so a working installation is assumed in the following steps.


## Backend 

### Redis Setup
**Make sure docker is running**
```
docker run -d --name redis -p 6379:6379 redis
```
This downloads a redis container image into docker if its not available, you only need to run this once, unless you delete the image, then run it again <br>
The following commands assumes that the container is named redis(as in the step above):
```
docker ps # Checks if the docker is running
docker stop redis # Stop redis if it's running
docker start redis # Start redis
```

### Setup Backend Environment Variables
Environment variables are not tracked for security reasons, the template file for the backend environment can be found in ```"file_templates/.backend_env"```

The following lines in the file should be changed to your preference:
```
REDIS_URL="redis://localhost:6379/0"     # This points to the redis server(whatever you set in the previous steps)
LTA_API_KEY="QmENf9GDT22jcv+l0VipIw=="   # API key will be removed soon
```
Make a copy of the file, rename the copy to ```".env"``` and move it to ```"backend/.env"```

### PostgreSQL
The project work with both SQLite and PostgreSQL in development but PostgreSQL is preferred for production<br>
In ```backend/backend/settings.py``` (SQLite code is commented out):
```
DATABASES = {
    # SQLITE
    # 'default': {
    #     'ENGINE': 'django.db.backends.sqlite3',
    #     'NAME': BASE_DIR / 'db.sqlite3',
    # }
    # PostGres
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'commutebuddy',       # Database Name
        'USER': 'postgres',           # Change this to whatever is set during PostgreSQL installation
        'PASSWORD': 'Password1234',   # Change this to whatever is set during PostgreSQL installation
        'HOST': 'localhost',          # Assume that the database is running on the same machine as the django server
        'PORT': '5432',               # Default port
    }
}
```
if PostgreSQL is used, run the following sql command in psql shell to create the initial database (this should only be ran once unless the database is deleted):
```
CREATE DATABASE commutebuddy;
```

### Run migrations
```
python manage.py makemigrations # Make the migration
python manage.py migrate        # Do the migration
```
Migrations command to be done everytime there are changes in database models or whenever a new database is created

### Populating Initial Data (Bus - MRT)
It is necessary to populate the initial data for bus and mrt after a fresh database is created
```
python manage.py populate_all_bus_stops
python manage.py populate_all_mrt_lines
python manage.py populate_all_mrt_stations
```

### Admin Operations
#### Creating Admin User
```
python manage.py createsuperuser
```
Create admin user (Allows access to CRUD operations on registered models through backend)<br>
**Note: Remember to migrate database**

#### Registering Models to Admin Site
```
# in admin.py
admin.site.register(MODEL_NAME)
```

### Run Backend Server:
```
python manage.py runserver
```

### Run Celery and Beat:
Run the followings in two separate terminals(Make sure they are in ```backend``` folder) <br><br>
Run Worker (This start the workers for the tasks):
```
celery -A backend worker -l info
```
Run Beat (This schedule the tasks for the worker):
```
celery -A backend beat -l info
```




## Frontend
Proper NodeJS installation is assumed

```
cd frontend
```

### Setup Frontend Environment Variables
Environment variables are not tracked for security reasons, the template file for the frontend environment can be found in ```"file_templates/.frontend_env"```

The following line in the file should be changed to your preference:
```
VITE_API_URL="http://127.0.0.1:8000"                                  # This points to the backend server(DJango)
VITE_GOOGLE_MAPS_API_KEY="AIzaSyDSZhU_zLhlQrU7ozPKjeuI4Kt5bvozxWs"    # API key will be removed soon
```
Make a copy of the file, rename the copy to ```".env"``` and move it to ```"frontend/.env"```

### Install Dependencies
```
npm install    # or yarn / npm
```

### Run Frontend Server:
```
npm run dev
```

## Testing on Mobile
Mobile browser only ask for location permission if both the frontend and backend is served through https, and to do so we need to provide an ssl certificate<br>

### Generating SSL Certificate
This can be done through [openssl](https://stackoverflow.com/questions/10175812/how-can-i-generate-a-self-signed-ssl-certificate-using-openssl) on windows. Place the ssl cert and key file in a folder called ```cert```, place this folder in both the root ```backend``` and  the root ```frontend``` folder

### Frontend
Comment out the section in ```vite.config.cjs``` to read in the ssl certificate and then run vite server as per normal:
```
npm run dev
```

### Backend 
Use this to run instead of the normal ```runserver``` command:
```
python manage.py runserver_plus 0.0.0.0:8000 --cert-file cert/cert.pem --key-file cert/key.pem
```

