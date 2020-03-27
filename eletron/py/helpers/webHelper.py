from selenium.common.exceptions import StaleElementReferenceException
from bs4 import BeautifulSoup
from bs4.element import Comment
import urllib.request

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


def get_element_fonts(driver, selector):
  elements = driver.find_elements_by_css_selector(selector)
  fonts = []
  for i, e in enumerate(elements):
      try:
          if e.value_of_css_property('display') != "none":
              font_family = map(str.strip, e.value_of_css_property('font-family').split(","))
              fonts.extend(font_family)
      except StaleElementReferenceException as e:
          print(e)
  
  return list(set(fonts))


def get_inner_html(driver):  # incomplete
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
  pass

def get_text_colors(driver):
  elements = driver.find_elements_by_css_selector("*")
  text_colors = []
  for i, e in enumerate(elements):
      try:
          if e.value_of_css_property('display') != "none":
              text_color =  e.value_of_css_property('color')
              text_colors.append(text_color)
      except StaleElementReferenceException as e:
          print(e)

  return list(set(text_colors))

def get_background_colors(driver):
  elements = driver.find_elements_by_css_selector("*")
  background_colors = []
  
  for i, e in enumerate(elements):
      try:
          if e.value_of_css_property('display') != "none":
              background_color = e.value_of_css_property("background-color")
              background_colors.append(background_color)
              # ADD FOR PROPERTY:background
      except StaleElementReferenceException as e:
          print(e)

  return list(set(background_colors))

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
  


def get_location(driver):
    pass