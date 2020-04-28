from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import StaleElementReferenceException, TimeoutException, NoSuchElementException
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import platform, os, re, types
from time import sleep, time
from flask import abort

from bs4 import BeautifulSoup
from bs4.element import Comment
import urllib.request
import nltk
# pip uninstall nltk-3.4.5 singledispatch-3.4.0.3 six-1.14.0 bs4

##################################################### 
#                   Sample test                     #
# sleep(5)  # let the user actually see something!  #
# search_box = driver.find_element_by_name('q')     #
# search_box.send_keys('chromedriver')              #
# search_box.submit()                               #
# sleep(5) # let the user actually see something!   #
#                                                   #
#####################################################

"""Initialize driver globally: 'global driver' to be used in definitions"""
driver = None

"""Initialize test site globally. If not supplied defaults to test_url"""
test_site = "automationpractice.com/index.php"
test_url = "https://www." + test_site
# Email user@phptravels.com
# Password demouser

"""Initialize and return driver"""
def initialize_driver(headless, capabilities=None, incognito=None):
  global driver
  
  driver = create_driver(headless, capabilities, incognito)

  return driver


def create_driver(headless, capabilities=None, incognito=None):
  """object for varying driver initializing options"""
  kwargs = { }
  executable_path = None

  """Create ChomeOptions object to configure driver"""
  chrome_options = Options()
  """Limit console loggin in headless mode"""
  chrome_options.add_argument("--log-level=3")
  # Set window size, primarily for testing
  chrome_options.add_argument("--window-size=500,500")

  """Set incognito mode if route arg is set to true"""
  if incognito:
    chrome_options.add_argument("--incognito")

  """Set headless mode if route arg is set to true"""
  if headless:
      chrome_options.add_argument("--headless")
  
  """Add options to arg object"""
  kwargs["options"] = chrome_options

  """Add executable path if custom chromedriver exists"""
  if executable_path and os.path.exists(executable_path):
    kwargs["executable_path"] = executable_path

  """Add desired capabilities if supplied"""
  if capabilities:
    kwargs["desired_capabilities"] = capabilities

  """Initialize driver with varied arg options"""
  driver = webdriver.Chrome(**kwargs)

  """
  Poll DOM for 2 seconds for locating elements
  Helps Avoid NoSuchElementException
  """
  driver.implicitly_wait(2)

  return driver

  
"""Instruct driver to navigate to url"""
def get_url(url):
  global driver
  global test_url
  global test_site
  test_url = url
  
  test_site = re.search(r"www.(\w+.\w+)\\?", url).group(1)
 
  driver.get(url)
  sleep(5)

  error = None
  try:
    error = driver.find_element_by_class_name('error-code')
  except NoSuchElementException as e:
    print(e)
  
  if error:
    "error", driver.execute_script("return arguments[0].innerText;", error)+": Please make sure the URL is correct"
  elif driver.title is None or "400 Bad Request" in driver.title:
    return "error", "Bad Request: Please make sure the URL is correct"
  else:
    return "success", "website contacted"


# Close instance of driver  
def quit_driver():
  global driver

  driver.quit()
  driver = None

  return "driver stopped"


"""
Save webpage html to local directory
"""
def save_source(address, source):
  name = address.replace(".", "-") + ".html"
  path = "./data/" + name

  if os.path.exists(path):
      return "page exists"
  else:
      f = open(path, 'w')
      f.write(source)
      f.close()
      return "page created"

      
"""Get elements on page, find unique fonts"""
def get_element_fonts():
  global driver
  elements = driver.find_elements_by_css_selector("*")
  fonts = []

  try:
    [ fonts.extend(map(str.strip, e.value_of_css_property("font-family").split(","))) for e in elements ]
  except StaleElementReferenceException as e:
      print(e)

  return list(set(fonts))


def get_inner_html():
  global test_url
  words = []
  html = urllib.request.urlopen(test_url).read()
  # puts the text into a file
  tokenizer = nltk.sent_tokenize(str(text_from_html(html)))
  html_file = open("data/html_file.txt", "w+")
  html_file.write(str(tokenizer))
  bad_words_list = ["news", "YOU", "WHERE", "stupid"] # enter trigger words here
  count = 0
  with open("data/html_file.txt","r") as file: # iterates over the list and checks it against the file
      reader = file.read()
      for lst in bad_words_list:
          if lst.casefold() in reader.casefold():
              words.append(lst)
              count += 1

  return list(set(words))

# finds the elements
def tag_visible(element):
    if element.parent.name in ["style", "script", "head", "title", "meta", "[document]"]:
        return False
    if isinstance(element, Comment):
        return False
    return True
# turns the html into text
def text_from_html(body):
    soup = BeautifulSoup(body, "html.parser")
    texts = soup.findAll(text = True)
    visible_texts = filter(tag_visible, texts)
    return u" ".join(t.strip() for t in visible_texts)


"""Get elemets, find unique colors"""
def get_text_colors():
  global driver
  elements = driver.find_elements_by_css_selector("*")

  try:
    text_colors = [ e.value_of_css_property("color") for e in elements ]
  except StaleElementReferenceException as e:
      print(e)

  return list(set(text_colors))


"""Get elements, find unique background colors"""
def get_background_colors():
  global driver
  elements = driver.find_elements_by_css_selector("*")
  
  try:
    background_colors = [ e.value_of_css_property("background-color") for e in elements ]
    # 'background' property may contain a set color as well as other properties
  except StaleElementReferenceException as e:
      print(e)

  return list(set(background_colors))


"""Compare list to entries in NoGo file"""
def nogo_search(file_name, lst):
  found = []
  try:
    with open(file_name) as f:
      for line in f:
        if line in lst:
          found.append(line)
  except:
    return "error"

  return None if len(found)==0 else found


"""
Get links on page, run links and record frontend/backend response times compared to navigation start

https://www.nngroup.com/articles/response-times-3-important-limits/
**Time from link: between .1-10 seconds
"""
def check_response():
  global driver
  global test_site
  elements = driver.find_elements_by_css_selector("a")
  backend_performance = []
  frontend_performance = []

  try:
    hrefs = [ e.get_attribute("href") for e in elements if (e.get_attribute("href") is not None and test_site in e.get_attribute("href")) ]
  except StaleElementReferenceException as e:
      print(e)

  # limit: 3 set for test purposes, limit to be supplied by test args

  for href in hrefs[0:3]:
    driver.get(href)
 
    """
    Reference: https://www.lambdatest.com/blog/how-to-measure-page-load-times-with-selenium/
    Use Navigation Timing  API to calculate the timings
    Methods return time in milliseconds
    """    
    navigationStart = driver.execute_script("return window.performance.timing.navigationStart")
    responseStart = driver.execute_script("return window.performance.timing.responseStart")
    domComplete = driver.execute_script("return window.performance.timing.domComplete")
    
    """
    Calculate the performance
    Add times to the lists
    """
    backend_performance.append(responseStart - navigationStart)
    frontend_performance.append(domComplete - responseStart)

    sleep(5)
    
  return backend_performance, frontend_performance


"""
Check system status response for delayed results

https://www.nngroup.com/articles/response-times-3-important-limits/
**Time from link: between .1-10 seconds

*Works for Towson...
"""
# Needs route
def check_system_status(timeout):
  global driver
  start_url = driver.current_url
  search_string = "Vampires"

  driver.maximize_window()
  """Set page load timeout for delayed system response"""
  driver.set_page_load_timeout(timeout)
  start_html = driver.page_source  

  test_driver = create_driver(headless=False, incognito=True)

  """
  Simulate user input and delayed response
  Page load greater than {timeout} will raise TimeOut exception
  """
  try:
    """Start a new Driver to retrieve expected page title to avoid cached webpage"""
    test_driver.get(start_url)
    test_driver.maximize_window()
    sleep(2)
    wait = WebDriverWait(test_driver, 10)
    element = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='text']")))
    element.send_keys(search_string)
    element.send_keys(u"\ue007")
    sleep(2)
    new_title = test_driver.title
    test_driver.quit()

    """Throttle network speed to simulate delayed system response"""
    driver.set_network_conditions(
      offline=False,
      latency=1000*timeout + 5000,  # additional latency (ms)
      download_throughput=1,  # maximal throughput
      upload_throughput=1   # maximal throughput
      )

    element = driver.find_element_by_xpath("//input[@type='text']")
    element.send_keys(search_string)
    element.send_keys(u"\ue007")

  except TimeoutException:
    """
    Check(1) if html changed dynamically after delayed response
    Return True if html has changed
    """
    driver.execute_script("window.stop();")
    element.clear()
    new_html = driver.page_source
    # # New html currently different when it should be the same 
    # print(new_html == start_html)
    # print(len(new_html), len(start_html))
    # return "Page content has changed in reponse to delayed response"

    """
    Check(2) if Alert is present after delayed response
    Return if Alert is present and alert text to verify
    Raise Exception if Alert is not present
    """
    driver.execute_script("alert('Hello! I am an alert box!');")
    try:
      WebDriverWait(driver, 3).until(EC.alert_is_present())
      alert = driver.switch_to_alert();
      return "Alert present after system delay", alert.text
    except:
      return "No system delay status response"


  # sleep(10)
  return "driver.get_network_conditions()"

"""Check for entry validity configuration"""
# Needs Route
def entry_validation_check():
  global driver
  driver.maximize_window()
  sleep(5)

  # Validation attributes by type
  attrs = {
    "submit": ["formnovalidate", "formenctype"],
    "files": ["accept", "required"],
    "number": ["min", "max" , "required"],
    "date": ["min", "max", "pattern", "required"],
    "image": ["formenctype"]
    }
  attrs.update(dict.fromkeys(["password", "email", "tel", "url", "search", "text"], ["minlength", "pattern", "placeholder", "required"]))
  attrs.update(dict.fromkeys(["week", "month", "time", "ranges"], ["min", "max"]))
  attrs.update(dict.fromkeys(["radio", "checkbox"], ["required"]))

  """Get input elements to check configuration, 10 second limit to find at least 1 element"""
  wait = WebDriverWait(driver, 10)
  elements = wait.until(EC.presence_of_all_elements_located((By.TAG_NAME, "input")))

  """For each input found, append to inputs with validation configuration"""
  inputs = {}
  for e in elements:
    id = str(e.id)
    input_type = e.get_attribute("type")
    # input_el.find_element_by_xpath('..')
    
    if input_type and input_type != "hidden":
      inputs[id] = {"type": e.get_attribute("type")}
      [inputs[id].update({a: (e.get_attribute(a) if e.get_attribute(a) else "Not Specified")}) for a in attrs[input_type]]
    elif input_type == "hidden":
      driver.execute_script("arguments[0].removeAttribute('hidden')", e)
      inputs[id] = {'type': "Hidden"}
    else:
      inputs[id] = {'type': "Not specified"}

    if id in inputs:
      driver.execute_script("arguments[0].setAttribute('style', 'background: yellow; border: 5px solid red;');", e)

  for i in inputs:
    print(i, ":", inputs[i])

  sleep(10)

  return ""