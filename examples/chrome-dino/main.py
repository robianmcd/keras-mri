from keras.models import Model
from keras.layers import Input, Conv2D, Flatten, Dense, concatenate
import numpy as np
import imageio
import os
import os.path as path
import kmri

base_path = path.dirname(path.realpath(__file__))
weights_path = path.join(base_path, 'model-weights.h5')
labeled_path = path.join(base_path, 'labeled-input.csv')
img_path = path.join(base_path, 'img-input')

# *****************************************************************************
# ******************************** Build model ********************************
# *****************************************************************************

labeled_input_layer = Input(shape=(3,), name='labeledInput')
img_input_layer = Input(shape=(38, 150, 1), name='imgInput')

x = Conv2D(16, kernel_size=8, strides=4, activation='relu')(img_input_layer)
x = Conv2D(32, kernel_size=4, strides=2, activation='relu')(x)
x = Flatten()(x)
x = concatenate([x, labeled_input_layer])
x = Dense(256, activation='relu')(x)
output = Dense(5)(x)

model = Model(inputs=[img_input_layer, labeled_input_layer], outputs=[output])
model.load_weights(weights_path)


# *****************************************************************************
# ******************************** Load inputs ********************************
# *****************************************************************************

labeled_input = np.loadtxt(labeled_path, delimiter=',')

read_img = lambda file_name: imageio.imread(os.path.join(img_path, file_name)).reshape(38,150,1) / 255
img_input = np.array([read_img(file_name) for file_name in os.listdir(img_path)])


# *****************************************************************************
# ****************************** Visualize Model*******************************
# *****************************************************************************

kmri.visualize_model(model, [img_input, labeled_input])