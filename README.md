# Keras MRI
Keras MRI is a neural network visualization tool for Keras.

# Install

```sh
pip install keras-mri
```

# Usage

```python
import kmri

from keras.models import Sequential
from keras.layers import Dense

model = Sequential([
    Dense(8, input_shape=(3,))
])

input_batch = [[1,2,3], [7,8,9]]
kmri.visualize_model(model, input_batch)
```
 
## Development

**Install package locally**

```
pip install -e .
```

**Deploy**

```
# Delete build, dist, and egg-info
python setup.py sdist bdist_wheel
python -m twine upload dist/*
```