import sys
from flask import Flask, request
from time import sleep, time

from helpers import webHelper

##############################################################
#                        Notes                               #     
#- Stale Element Exception is raised if wait is not provided #
#- Need to find a better method than sleep()                 #
#                                                            #
##############################################################


app = Flask(__name__)

@app.route('/')
def hello_world():
    return ('Hello, World!')


"""Initialize chrome driver"""
@app.route('/init', methods=['GET'])
def initiate_driver():
    headless = request.args.get("headless", default=False) # set to False default
    print(headless)
    driver = webHelper.initialize_driver(headless=(True if headless=="True" else False))

    return {"data": "initiated", "result": "success"}


"""
Instruct driver to navigate to url
Must be called before other definitions
"""
@app.route('/get', methods=['GET'])
def get_url():
    webHelper.get_url()

    return {"data": "webpage contacted", "result": "success"}


"""Close instance of driver"""  
@app.route('/quit', methods=['GET'])
def quit_driver():

    webHelper.quit_driver()
  
    return {"data": "stopped", "result": "success"}


"""Save document of source to inspect locally"""
@app.route('/save_source', methods=['GET'])
def save_source(address, source):
    return webHelper.save_source(address, source)


"""Get the unique fonts of elements"""
@app.route('/get_fonts', methods=['GET'])
def get_element_fonts():

    fonts = webHelper.get_element_fonts()
    result, desc = quantitativeAnalysis(6, fonts)

    return {"data": " ".join(fonts), "result": result, "desc": desc}


"""Get unique text colors on page"""
@app.route('/get_text_colors', methods=['GET'])
def get_text_colors():

    colors = webHelper.get_text_colors()
    result, desc = quantitativeAnalysis(10, colors)

    return {"data": " ".join(colors), "result": result, "desc": desc}


"""Initialize to be used globally"""
background_colors = None

"""Get unique background colors on page"""
@app.route('/get_background_colors', methods=['GET'])
def get_background_colors():
    global background_colors

    background_colors = webHelper.get_background_colors()
    result, desc = quantitativeAnalysis(10, background_colors)

    return {"data": " ".join(background_colors), "result": result, "desc": desc}


"""Get quantitative analysis of similar definitions to determine pass/fail"""
def quantitativeAnalysis(passNum, arr):
    result = "Pass" if len(arr) <= passNum else "Fail"
    desc = "Number of Different font colors: " + str(len(arr)) + "\nAcceptable Number: " + str(passNum)

    return result, desc


"""Get whether colors used are included in NoGoColors.txt"""
@app.route('/get_nogo_colors/<choice>', methods=['GET'])
def get_nogo_colors(choice):
    global background_colors

    if choice == "background":
        if background_colors is None:
            background_colors = webHelper.get_background_colors()

        colors = webHelper.nogo_search('noGoColors.txt', background_colors) 

    if choice == "text":
        pass

    if colors == "error":
        return {"data": colors, "result": "Fail", "desc": "noGoColors.txt file not found"}
    else:
        if colors:
            return {"data": " ".join(colors), "result": "Fail", "desc": "No-go colors were found"}
        else:
            return {"data": "None", "result": "Pass", "desc": "No No-go colors were found"}


inner_text = None
###############################################
#                   ***FIX***
@app.route('/get_nogo_text/text', methods=['GET'])
def get_nogo_text():
    global inner_text

    inner_text = webHelper.get_inner_html()

    if len(inner_text) > 0:
        return {"data": " ".join(inner_text), "result": "Fail", "desc": "No-go words were found"}
    else:
        return {"data": "None", "result": "Pass", "desc": "No No-go colors were found"}

# @app.route('/get_nogo_text/<choice>')
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

#                   ***FIX***
#######################################################


"""
Get average backend/frontend response time
Headless mode to be set to true to emulate user interaction

https://www.nngroup.com/articles/response-times-3-important-limits/
**Time from link: between .1-10 seconds
"""
@app.route('/get_avg_response', methods=['GET'])
def get_avg_response():
    acceptable = request.args.get("acceptable", default=10000)
    acceptable_back = request.args.get("back", default= 5000)
    acceptable_front = request.args.get("front", default= 5000)

    backend_performance, frontend_performance = webHelper.check_response()

    print(backend_performance, frontend_performance)

    backend_avg = sum(backend_performance) / len(backend_performance)
    frontend_avg = sum(frontend_performance) / len(frontend_performance)

    backend_accept = 5000 
    frontend_accept = 5000

    backend_result ="backend: " + "Pass" if backend_avg < backend_accept else "Fail"
    frontend_result ="frontend: " + "Pass" if frontend_avg < frontend_accept else "Fail"

    backend_avg = str("backend: %dms" % backend_avg)
    frontend_avg = str("frontend: %dms" % frontend_avg)

    desc = "Acceptable average"

    return {"data": [backend_avg, frontend_avg], "result": [backend_result, frontend_result], "desc": desc}


"""Route to test webhelper definitions""" 
@app.route('/test')
def test():
    headless = request.args.get("headless", False) # set to False default
    print(webHelper.initialize_driver(headless))
    print(get_url())
    
    start = time()
    # print(webHelper.check_system_status(5))
    print(webHelper.entry_validation_check())
    print(time() - start)

    print(quit_driver())

    return ""
    

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000, debug=True)
    
