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

    return {"data": "initiated", "result": "success"}

@app.route('/get', methods=['GET'])
def get_url():
    global driver
    driver.get("https://www.towson.edu")
    time.sleep(5)
    return {"data": "webpage contacted", "result": "success"}
    
@app.route('/quit', methods=['GET'])
def quit_driver():
    global driver
    driver.quit()
    return {"data": "stopped", "result": "success"}

## Sample test
# time.sleep(5)  # let the user actually see something!
# search_box = driver.find_element_by_name('q')
# search_box.send_keys('chromedriver')
# search_box.submit()
# time.sleep(5) # let the user actually see something!

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


@app.route('/get_text_colors')
def get_text_colors():
    global driver
    colors = webHelper.get_text_colors(driver)
    print(colors)
    result, desc = quantitativeAnalysis(10, colors)
    return {"data": " ".join(colors), "result": result, "desc": desc}

background_colors = None

@app.route('/get_background_colors')
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

@app.route('/get_nogo_colors/<choice>')
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

@app.route('/get_nogo_text/text')
def get_nogo_text():
    global driver
    global inner_text
    inner_text = webHelper.get_inner_html(driver)
    print(inner_text)

    time.sleep(5)
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

@app.route('/get_avg_response')
def get_avg_response():
    global driver
    global background_colors

    response = webHelper.check_response(driver)
    avg = sum(response) / len(response)
    accept = 5
    result = "Pass" if avg < accept else "Fail"
    desc = "Acceptable average"
    return {"data": avg, "result": result, "desc": desc}


@app.route('/test')
def test():
    global driver
    print(initiate_driver())
    print(get_url())
    response = webHelper.check_response(driver)
    print(quit_driver())
    return {"data": response[:3]}
    



if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000, debug=True)
    
