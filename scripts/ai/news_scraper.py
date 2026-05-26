"""
Simple RSS/news scraper example (Python) — copied/adapted.
Install: pip install feedparser requests beautifulsoup4

This script collects items from RSS feeds and normalizes them.
"""
import feedparser
import requests
from bs4 import BeautifulSoup

FEEDS = [
    'https://www.chess.com/news/feed',
    # add more feeds
]


def fetch_rss(feed_url):
    d = feedparser.parse(feed_url)
    items = []
    for e in d.entries:
        item = {
            'title': e.get('title'),
            'link': e.get('link'),
            'published': e.get('published'),
            'summary': e.get('summary')
        }
        items.append(item)
    return items


def fetch_article_body(url):
    r = requests.get(url, timeout=10)
    soup = BeautifulSoup(r.text, 'html.parser')
    article = soup.find('article') or soup.find('div', {'class': 'article'})
    text = article.get_text(separator='\n').strip() if article else ''
    return text


if __name__ == '__main__':
    all_items = []
    for feed in FEEDS:
        try:
            items = fetch_rss(feed)
            all_items.extend(items)
        except Exception as e:
            print('Feed error', feed, e)

    print(f'Found {len(all_items)} items')
