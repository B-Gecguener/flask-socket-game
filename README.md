Quick-start guide for visual studio code, it can be different for other code editors:

1. Open the terminal and navigate to the directory you want to copy the project to
2. clone the repository:
   git clone https://github.com/B-Gecguener/flask-socket-game.git

3. Open the project, File -> open Folder

4. Initialize and start the virtual environment in the terminal:
   python -m venv venv
   Change the terminal from powershell to command prompt
   venv\Scripts\activate  # for Windows
   . venv/bin/activate    # for Linux and MacOs

5. Install requirements:
   pip install -r requirements.txt

6. Initialize database:
   set FLASK_APP=gameapp 
   flask db init
   create_db.py

7. Run website:
   run.py

Have fun!
