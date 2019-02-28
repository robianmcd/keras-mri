import numpy as np
import os
import os.path as path
from keras.applications import vgg16, inception_v3, resnet50, mobilenet
from keras.preprocessing.image import load_img
from keras.preprocessing.image import img_to_array

import kmri

base_path = path.dirname(path.realpath(__file__))
img_path = path.join(base_path, 'img')

#Load the VGG model
model = vgg16.VGG16(weights='imagenet')

# #Load the Inception_V3 model
#model = inception_v3.InceptionV3(weights='imagenet')
#
# #Load the ResNet50 model
# model = resnet50.ResNet50(weights='imagenet')

#Load the MobileNet model
# model = mobilenet.MobileNet(weights='imagenet')


def get_img(file_name):
    image = load_img(path.join(img_path, file_name), target_size=(224, 224))
    return img_to_array(image) / 256

img_input = np.array([get_img(file_name) for file_name in os.listdir(img_path)])

kmri.visualize_model(model, img_input)