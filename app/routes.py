from flask import Blueprint, render_template, redirect, url_for

main = Blueprint("main", __name__)

@main.route("/")
def home():
    return render_template("home.html")

@main.route("/new")
def new_song():
    return render_template("new.html")

@main.route("/edit/<song_id>")
def edit_song(song_id):
    return render_template("edit.html", song_id=song_id)
