from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from bs4 import BeautifulSoup
import time
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import json

def get_likes(username):
    service = Service(ChromeDriverManager().install())  # or provide your own path to chromedriver
    driver = webdriver.Chrome(service=service)

    driver.get(f"https://soundcloud.com/{username}/likes")
    time.sleep(5)  # wait for content to load

    # Scroll multiple times to load more tracks
    scroll_count = 0
    while scroll_count < 5:  # scroll 5 times (adjust if necessary)
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(5)  # wait for content to load after each scroll
        scroll_count += 1

    # Get page source and parse
    soup = BeautifulSoup(driver.page_source, 'html.parser')

    # Extract song titles and artists
    tracks = []
    for card in soup.select('li.soundList__item'):
        title_tag = card.select_one('a.soundTitle__title')
        user_tag = card.select_one('span.soundTitle__usernameText')

        if title_tag and user_tag:
            title = title_tag.text.strip()
            artist = user_tag.text.strip()
            link = 'https://soundcloud.com' + title_tag['href']
            tracks.append({'title': title, 'artist': artist, 'link': link})

    driver.quit()

    # Print results (optional)
    # for track in tracks:
    #     print(f"{track['title']} by {track['artist']}\nLink: {track['link']}\n")

    with open("../data/liked_tracks.json", "w", encoding="utf-8") as f:
        json.dump(tracks, f, ensure_ascii=False, indent=2)