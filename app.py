from flask import Flask, render_template, jsonify

app = Flask(__name__)

# Add new announcements to this list. Give every announcement a unique ID.
# The browser checks this list while the website is open.
ANNOUNCEMENTS = [
    {
        "id": "welcome-2026-01",
        "title": "Grama Seva updates are available",
        "message": "Visit Latest Updates to read information about government programmes and sanitation.",
        "date": "2026-11-17",
        "url": "/updates",
    }
]


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/schemes")
def schemes():
    return render_template("schemes.html")
@app.route("/updates")
def updates():
    return render_template("updates.html")
@app.route("/report")
def report():
    return render_template("report.html")


@app.route("/api/announcements")
def announcements():
    """Return announcements for the notification centre."""
    return jsonify(ANNOUNCEMENTS)


if __name__ == "__main__":
    app.run(debug=True)