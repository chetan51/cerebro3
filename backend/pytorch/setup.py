import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="cerebro3_pytorch",
    version="0.0.1",
    author="Chetan Surpur",
    author_email="chetan.surpur@gmail.com",
    description="Pytorch backend for Cerebro 3 (a web-based visualization platform for Neural Networks.)",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/chetan51/cerebro3",
    packages=setuptools.find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.6',
)
