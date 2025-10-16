# 2006-SCS7-46

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



## Backend 

### Run migrations & dev server
```
python manage.py makemigrations # Make the migration
python manage.py migrate        # Do the migration
```
Migrations command to be done everytime there are changes in database models

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

#### Run Backend Server:
```
python manage.py runserver
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
VITE_API_URL = "http://localhost:1234" # This points to the backend server(DJango)
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

