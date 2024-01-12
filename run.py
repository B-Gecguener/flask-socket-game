from gameapp import create_app, io

app = create_app()

io.run(app, allow_unsafe_werkzeug=True)