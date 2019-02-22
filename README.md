# Keras MRI
Keras MRI is a neural network visualization tool for Keras.


## TODOs
 - Dynamic layer width
 - Make pip package
 - test with other networks
 - support common layers. e.g. activation, max pooling, dropout?
 - Add buttons for play/pause/next
 - expand/colapse nodes. Maybe use different edge rendering technique when expanded 
 
 - Show edge weights / show edge outputs
 - Show convolutional filters
    - https://www.analyticsvidhya.com/blog/2018/03/essentials-of-deep-learning-visualizing-convolutional-neural-networks/
 - Integrate visualization techniques from https://raghakot.github.io/keras-vis/
 - add configurable labels/icons for input/output layers
 - Show node value in tooltip
 
## Development

**Install package locally**

```
pip install -e .
```

**Deploy**

```
python setup.py sdist bdist_wheel
python -m twine upload dist/*
```