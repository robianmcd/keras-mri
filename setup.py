import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="keras-mri",
    version="0.0.1",
    author="Rob McDiarmid",
    author_email="robianmcd@gmail.com",
    description="Neural network visualization tool for Keras",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/robianmcd/keras-mri",
    packages=setuptools.find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
)
