from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from bs4 import BeautifulSoup
import time
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

service = Service(ChromeDriverManager().install())  # or provide your own path to chromedriver
driver = webdriver.Chrome(service=service)

driver.get("https://soundcloud.com/malcolm-makkonen/likes")
time.sleep(5)  # wait for content to load

# Scroll to load more (optional)
driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
time.sleep(5)

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

# Print results
for track in tracks:
    print(f"{track['title']} by {track['artist']}\nLink: {track['link']}\n")
