from gameapp import app , io

io.run(app, host='0.0.0.0', port='5000', allow_unsafe_werkzeug=False)
#io.run(app, allow_unsafe_werkzeug=False)