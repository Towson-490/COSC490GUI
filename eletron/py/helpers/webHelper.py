from selenium.common.exceptions import StaleElementReferenceException

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
    fonts = list(set(fonts))
    
    return fonts


def get_inner_html(driver):  # incomplete
    elements = driver.find_elements_by_css_selector("*")
    text = ""
    for i, e in enumerate(elements):
        try:
            if e.value_of_css_property('display') != "none":
                inner = driver.execute_script("return arguments[0].textContent", e)
                text = text + " " + inner
        except StaleElementReferenceException as e:
            print(e)

    return text


def get_element_colors(driver):
    element = driver.find_element_by_tag_name("body")
    text_colors = []
    color = element.value_of_css_property('color')
    print(str(color))
    #color = "".join(element.value_of_css_property('color'))
    text_colors.extend(color)

    # elements = driver.find_elements_by_css_selector("*")
    # text_colors = []
    # for i, e in enumerate(elements):
    #     try:
    #         if e.value_of_css_property('display') != "none":
    #             #text_color =  map(str.strip, e.value_of_css_property('color').split(")"))
    #             #text_colors.extend(text_color)
    #             text_colors.extend("".join(e.value_of_css_property('color')))
    #     except StaleElementReferenceException as e:
    #         print(e)

    return text_colors