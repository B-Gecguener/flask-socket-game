from gameapp import app , io

print("this is a test")

io.run(app, allow_unsafe_werkzeug=True)