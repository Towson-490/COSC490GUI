from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import StaleElementReferenceException, TimeoutException
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import platform, os
from time import sleep, time
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

# Initialize driver globally: 'global driver' to be used in definitions
driver = None

# Initialize and return driver
def initialize_driver(headless, capabilities=None, incognito=None):
  global driver
  
  driver = create_driver(headless, capabilities=None, incognito=None)
  
  return driver

def create_driver(headless, capabilities=None, incognito=None):
  kwargs = { }
  executable_path = None
  # Create ChomeOptions object to configure driver
  chrome_options = Options()
  # Limit console loggin in headless mode
  chrome_options.add_argument("--log-level=3")
  chrome_options.add_argument("--window-size=500,500")

  if incognito:
    chrome_options.add_argument("--incognito")

  if headless == "true":
      # Set headless mode if route arg is set to true
      chrome_options.add_argument("--headless")
  
  kwargs['options'] = chrome_options

  # Check Chrome version to download appropriate binaries
  # Add binaries to directory (drivers) and specify executable path in Chrome()
  # Executable_path:optional argument, if not specified will search path.
  if platform.system() == "Windows":
      executable_path='drivers/chromedriver_win32/chromedriver.exe'
  elif platform.system() == 'Linux':
      executable_path='drivers/chromedriver.exe'
  elif platform.system() == 'Darwin':
      executable_path='drivers/chromedriver'

  if executable_path:
    kwargs['executable_path'] = executable_path
  if capabilities:
    kwargs['desired_capabilities'] = capabilities

  driver = webdriver.Chrome(**kwargs)

  # Poll DOM for 2 seconds for locating elements
  driver.implicitly_wait(2)

  return driver
  
# Instruct driver to navigate to url
def get_url():
  global driver
  # For testing purposes. Will be replaced by arg in route
  driver.get("https://www.towson.edu")
  sleep(5)

# Close instance of driver  
def quit_driver():
  global driver
  driver.quit()

# Save webpage html to local directory
def save_source(address, source):
  name = address.replace('.', '-') + '.html'
  path = './data/' + name

  if os.path.exists(path):
      return 'page exists'
  else:
      f = open(path, 'w')
      f.write(source)
      f.close()
      return 'page created'
      
# Get elements on page, find unique fonts
def get_element_fonts():
  global driver
  elements = driver.find_elements_by_css_selector("*")
  fonts = []

  try:
    [ fonts.extend(map(str.strip, e.value_of_css_property('font-family').split(","))) for e in elements ]
  except StaleElementReferenceException as e:
      print(e)

  return list(set(fonts))
    
###########################################################################
#                         ***FIX***
def get_inner_html():  # incomplete
  # global driver
  # elements = driver.find_elements_by_css_selector("*")
  # text = ""
  # for i, e in enumerate(elements):
  #     try:
  #         if e.value_of_css_property('display') != "none":
  #             inner = driver.execute_script("return arguments[0].textContent", e)
  #             text = text + " " + inner
  #     except StaleElementReferenceException as e:
  #         print(e)

  # return text
  words = []
  html = urllib.request.urlopen('https://www.towson.edu/').read()
  # puts the text into a file
  tokenizer = nltk.sent_tokenize(str(text_from_html(html)))
  html_file = open("html_file.txt", "w+")
  html_file.write(str(tokenizer))
  bad_words_list = ['news','YOU','WHERE','stupid'] # enter trigger words here
  count = 0
  with open('html_file.txt','r') as file: # iterates over the list and checks it against the file
      reader = file.read()
      for lst in bad_words_list:
          if lst.casefold() in reader.casefold():
              words.append(lst)
              print("Trigger word found: '" + lst + "' shows up on the website")
              count += 1
          else:
              print('false')

  return list(set(words))

# finds the elements
def tag_visible(element):
    if element.parent.name in ['style', 'script', 'head', 'title', 'meta', '[document]']:
        return False
    if isinstance(element, Comment):
        return False
    return True
# turns the html into text
def text_from_html(body):
    soup = BeautifulSoup(body, 'html.parser')
    texts = soup.findAll(text = True)
    visible_texts = filter(tag_visible, texts)
    return u" ".join(t.strip() for t in visible_texts)
#                              ***FIX***
############################################################################

# Get elemets, find unique colors
def get_text_colors():
  global driver
  elements = driver.find_elements_by_css_selector("*")

  try:
    text_colors = [ e.value_of_css_property('color') for e in elements ]
  except StaleElementReferenceException as e:
      print(e)

  return list(set(text_colors))

# Get elements, find unique background colors
def get_background_colors():
  global driver
  elements = driver.find_elements_by_css_selector("*")
  
  try:
    background_colors = [ e.value_of_css_property('background-color') for e in elements ]
    # 'background' property may contain a set color as well as other properties
  except StaleElementReferenceException as e:
      print(e)

  return list(set(background_colors))

# Compare list to entries in NoGo file
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

# Get links on page, run links and record frontend/backend response times compared to navigation start
def check_response(): # https://www.lambdatest.com/blog/how-to-measure-page-load-times-with-selenium/
  global driver
  elements = driver.find_elements_by_css_selector('a')
  backend_performance = []
  frontend_performance = []

  try:
    # www.towson.edu for test purposes, will be supplied by domain specified in test
    hrefs = [ e.get_attribute("href") for e in elements if "towson.edu" in e.get_attribute("href") ]
  except StaleElementReferenceException as e:
      print(e)

  # limit: 3 set for test purposes, limit to be supplied by test args
  for href in hrefs[0:3]:
    driver.get(href)
 
    # Use Navigation Timing  API to calculate the timings
    # Methods return time in milliseconds    
    navigationStart = driver.execute_script("return window.performance.timing.navigationStart")
    responseStart = driver.execute_script("return window.performance.timing.responseStart")
    domComplete = driver.execute_script("return window.performance.timing.domComplete")
    
    # Calculate the performance
    # Add times to the lists
    backend_performance.append(responseStart - navigationStart)
    frontend_performance.append(domComplete - responseStart)

    sleep(10)
    
  return backend_performance, frontend_performance

# page_loads_within_timeout(start_url, timeout)
class page_loads_within_timeout(object):
  # 
  def __init__(self, start_url, timeout):
    self.start_url = start_url
    self.timeout = timeout

  def __call__(self, driver):
    if driver.current_url != self.start_url:
        return True
    else:
        return False

# Check system status response for delayed results
def check_system_status(timeout):
  global driver
  start_url = driver.current_url
  search_string = "This is a search string"
  print(start_url)
  sleep(2)
  driver.maximize_window()
  driver.set_page_load_timeout(timeout)
  start_html = driver.page_source  

  test_driver = create_driver("false", incognito=True)

  try:
    print("\n*********Starting new driver*********\n")
    test_driver.get(start_url)
    sleep(2)
    test_driver.maximize_window()
    wait = WebDriverWait(test_driver, 10)
    print("\n*********Getting input for new page*********\n")
    element = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='text']")))
    print("\n*********Sending search string*********\n")
    element.send_keys(search_string)
    element.send_keys(u'\ue007')
    sleep(2)
    print("\n*********Getting expected new title*********\n")
    new_title = test_driver.title
    print(new_title)
    test_driver.quit()

    print("\n*********Setting network conditions*********\n")
    # Throttle network speed to simulate delayed system response
    driver.set_network_conditions(
      offline=False,
      latency=1000*timeout + 5000,  # additional latency (ms)
      download_throughput=1,  # maximal throughput
      upload_throughput=1   # maximal throughput
      )

    print("\n*********Sending input for test*********\n")
    element = driver.find_element_by_xpath("//input[@type='text']")
    element.send_keys(search_string)
    element.send_keys(u'\ue007')

  except TimeoutException:
    print("\n********Stopping Execution*******\n")
    driver.execute_script("window.stop();")
    element.send_keys(u'\ue005')
    new_html = driver.page_source
    print(new_html.replace(start_html, ''))
    sleep(10)
    return "No system delay status response"
  finally:
    pass
    # driver.get(start_url)
  # sleep(10)
  return "driver.get_network_conditions()"

# Check for entry validity configuration
def entry_validation_check(driver):
  pass