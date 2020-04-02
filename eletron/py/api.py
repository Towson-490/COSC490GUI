import sys
from flask import Flask
import os
from time import sleep
import platform
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

from helpers import webHelper

app = Flask(__name__)

@app.route('/')
def hello_world():
    return ('Hello, World!')

driver = None

@app.route('/init/headless=<headless>', methods=['GET'])
def initiate_driver(headless):
    global driver
    chrome_options = Options()
    chrome_options.add_argument("--log-level=3")
    chrome_options.add_argument("--window-size=500,500")
    if headless == "true":
        chrome_options.add_argument("--headless")
    # Check Chrome version to download appropriate binaries
    # Add binaries to directory (drivers) and specify executable path in Chrome()
    if platform.system() == "Windows":
        driver = webdriver.Chrome(options=chrome_options, executable_path='drivers/chromedriver_win32/chromedriver.exe')  
            # executable_path:optional argument, if not specified will search path.
    elif platform.system() == 'Linux':
        driver = webdriver.Chrome(executable_path='drivers/chromedriver.exe')
    elif platform.system() == 'Darwin':
        driver = webdriver.Chrome(executable_path='drivers/chromedriver')
    else:
        driver = webdriver.Chrome()

    return {"data": "initiated", "result": "success"}

# Must be called before other functions
@app.route('/get', methods=['GET'])
def get_url():
    global driver
    driver.get("https://www.towson.edu")
    sleep(5)
    return {"data": "webpage contacted", "result": "success"}
    
@app.route('/quit', methods=['GET'])
def quit_driver():
    global driver
    driver.quit()
    return {"data": "stopped", "result": "success"}

## Sample test
# sleep(5)  # let the user actually see something!
# search_box = driver.find_element_by_name('q')
# search_box.send_keys('chromedriver')
# search_box.submit()
# sleep(5) # let the user actually see something!

@app.route('/save_source', methods=['GET'])
def save_source(address, source):
    return webHelper.save_source(address, source)

# Stale Element Exception is raised if wait is not provided
# Need to find a better method than sleep()
@app.route('/get_fonts', methods=['GET'])
# def get_element_fonts(selector):
def get_element_fonts():
    global driver
    selector = "*"
    fonts = webHelper.get_element_fonts(driver, selector)
    result, desc = quantitativeAnalysis(6, fonts)
    return {"data": " ".join(fonts), "result": result, "desc": desc}


@app.route('/get_text_colors', methods=['GET'])
def get_text_colors():
    global driver
    colors = webHelper.get_text_colors(driver)
    print(colors)
    result, desc = quantitativeAnalysis(10, colors)
    return {"data": " ".join(colors), "result": result, "desc": desc}

background_colors = None

@app.route('/get_background_colors', methods=['GET'])
def get_background_colors():
    global driver
    global background_colors

    background_colors = webHelper.get_background_colors(driver)
    result, desc = quantitativeAnalysis(10, background_colors)
    return {"data": " ".join(background_colors), "result": result, "desc": desc}

def quantitativeAnalysis(passNum, arr):
    result = "Pass" if len(arr) <= passNum else "Fail"
    desc = "Number of Different font colors: " + str(len(arr)) + "\nAcceptable Number: " + str(passNum)
    return result, desc

@app.route('/get_nogo_colors/<choice>', methods=['GET'])
def get_nogo_colors(choice):
    global background_colors
    global driver

    if choice == "background":
        if background_colors is None:
            background_colors = webHelper.get_background_colors(driver)

        colors = webHelper.nogo_search('noGoColors.txt', background_colors) 

    if colors == "error":
        return {"data": colors, "result": "Fail", "desc": "noGoColors.txt file not found"}
    else:
        if colors:
            return {"data": " ".join(colors), "result": "Fail", "desc": "No-go colors were found"}
        else:
            return {"data": "None", "result": "Pass", "desc": "No No-go colors were found"}

inner_text = None
###############################################

@app.route('/get_nogo_text/text', methods=['GET'])
def get_nogo_text():
    global driver
    global inner_text
    inner_text = webHelper.get_inner_html(driver)
    print(inner_text)

    if len(inner_text) > 0:
        return {"data": " ".join(inner_text), "result": "Fail", "desc": "No-go words were found"}
    else:
        return {"data": "None", "result": "Pass", "desc": "No No-go colors were found"}
#######################################################
# @app.route('/get_nogo_text/<choice>') # Need get_inner_html
# def get_nogo_text(choice):
#     global inner_text
#     global driver
    
#     if choice == "text":
#     #     if inner_text is None:
#     #         inner_text = webHelper.get_inner_html(driver)

#     #     text = webHelper.nogo_colors('noGoText.txt', inner_text) 
#         text = "INCOMPLETE: Disregard"

#     if text == "error":
#         return {"data": text, "result": "Fail", "desc": "noGoText.txt file not found"}
#     else:
#         if text:
#             return {"data": " ".join(text), "result": "Fail", "desc": "No-go text was found"}
#         else:
#             return {"data": "None", "result": "Pass", "desc": "No No-go text was found"}

# Makes sense for headless mode to be set to true
@app.route('/get_avg_response', methods=['GET'])
def get_avg_response():
    global driver

    backend_performance, frontend_performance = webHelper.check_response(driver)

    print(backend_performance, frontend_performance)

    backend_avg = sum(backend_performance) / len(backend_performance)
    frontend_avg = sum(frontend_performance) / len(frontend_performance)

    backend_accept = 2000
    frontend_accept = 2000

    backend_result ="backend:" + "Pass" if backend_avg < backend_accept else "Fail"
    frontend_result ="frontend:" + "Pass" if frontend_avg < frontend_accept else "Fail"

    backend_avg = str("backend: %dms" % backend_avg)
    frontend_avg = str("frontend: %dms" % frontend_avg)

    desc = "Acceptable average"

    return {"data": [backend_avg, frontend_avg], "result": [backend_result, frontend_result], "desc": desc}


@app.route('/test')
def test():
    global driver
    print(initiate_driver("true"))
    print(get_url())
    response = get_avg_response()
    print(quit_driver())
    return response
    

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000, debug=True)
    
