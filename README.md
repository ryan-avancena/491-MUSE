# 491 - MUSE

## installation 

Ensure the following are installed on your system: Git, Python, Node.js

Clone the repository: git clone https://github.com/ryan-avancena/491-MUSE.git

Direct into repository: cd 491-MUSE

Install Python dependencies: pip install -r requirements.txt

Create a virtual environment with python -m venv venv (Windows) or py -3.11 -m venv venv (MacOS).

Activate the virtual environment with ./venv/Scripts/activate (Windows) or source ./venv/bin/activate (MacOS).

## running the application 

Open 2 terminals.

In one terminal type: cd server

Once you’re in the server directory, run node server.js

In the second terminal: cd client

python app.py (windows) or python3 app.py (macos)

## preface

keep in mind, i have only tried mixing twice in my life (and i loved it)

but i always listen to boiler rooms, live sets, or festival music whenever i study

plus it has always been one of my dreams to be a producer/dj/or a contributor to the music industry

with that being said, MUSE is my "first contribution" to this industry

## how it works

a user enters their SoundCloud account name into the search bar 

the application begins to scrape the users' liked songs, as you can connect SoundCloud+ to software like rekordbox and Serato Pro

after scraping and embedding the users' liked songs, we apply FAISS embeddings to embed the songs in a 3d space

the DJ can see the song in this embedded space to see possible songs to mix into
