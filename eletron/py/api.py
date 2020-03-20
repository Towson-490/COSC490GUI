import sys
from flask import Flask
import os
import time
import platform
from selenium import webdriver

from helpers import webHelper

app = Flask(__name__)

@app.route('/')
def hello_world():
    return ('Hello, World!')

driver = None

    
@app.route('/init', methods=['GET'])
def initiate_driver():
    global driver
    # Check Chrome version to download appropriate binaries
    # Add binaries to directory (drivers) and specify executable path in Chrome()
    if platform.system() == "Windows":
        driver = webdriver.Chrome(
            executable_path='drivers/chromedriver_win32/chromedriver.exe')  # optional argument, if not specified will search path.
    elif platform.system() == 'Linux':
        driver = webdriver.Chrome(executable_path='drivers/chromedriver.exe')
    elif platform.system() == 'Darwin':
        driver = webdriver.Chrome(executable_path='drivers/chromedriver')
    else:
        driver = webdriver.Chrome()

    return ("initiated")

@app.route('/get', methods=['POST'])
def get_url():
    global driver
    driver.get("https://www.towson.edu")
    time.sleep(5)
    
@app.route('/quit', methods=['GET'])
def quit_driver():
    global driver
    driver.quit()
    return ("stopped")

## Sample test
# time.sleep(5)  # let the user actually see something!
# search_box = driver.find_element_by_name('q')
# search_box.send_keys('chromedriver')
# search_box.submit()
# time.sleep(5) # let the user actually see something!

@app.route('/save_source')
def save_source(address, source):
    return webHelper.save_source(address, source)

# Stale Element Exception is raised if wait is not provided
# Need to find a better method than sleep()
@app.route('/get_fonts')
def get_element_fonts(selector):
    global driver
    fonts = webHelper.get_element_fonts(driver, selector)
    print(fonts)
    print("Number of fonts (including fallbacks): ", len(fonts))


@app.route('/get_html')
def get_inner_html():
    global driver
    text = webHelper.get_inner_html(driver)
    print(text)


@app.route('/get_colors')
def get_element_colors():
    global driver
    colors = webHelper.get_element_colors(driver)
    print(colors)



if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000, debug=True)
    
