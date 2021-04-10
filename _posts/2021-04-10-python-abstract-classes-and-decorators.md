---
layout: post
title: Python Abstract Classes and Decorators
date: 2021-04-10 21:00:00 -0700
category: post
---
### OOP in Python
Python considers itself to be an object oriented programming language (to nobody's surprise). This means that there are ways to make the most out of object-oriented design principles such as defining properties in class, or even making a class abstract. This post will be a quick introduction on Abstract Base Classes, as well as the property decorator.

Starting with Abstract Base Classes, chances are you want to instantiate different classes with the same basis. Maybe the classes are different flavors of a certain ice cream, or maybe they are different buttons that perform different functions for a Television remote. Either way, there's some layer of abstraction that you want to establish, in which future classes will follow from.

Python's usage of these abstractions is done via. the AbstractBaseClass library (or ABC). Say we want to follow an example similar to the briefly mentioned TV example. We have a bunch of different buttons that perform different types of work for the TV. We can do the following:

```python
from abc import ABC, abstractmethod

class TVButton(ABC):
    @abstractmethod
    def press(self):
        pass
```

There's quite a few things happening in the above code:
- We created an abstract class `TVButton` (in practice, we might have some properties defined in this class that all TVButton subclasses will have in common)
- We defined a method `press` which doesn't do anything in this current function. This makes sense since we want to make the implementation dependent on the sub classes of this abstract class. 
- There's also a line above our definition: `@abstractmethod`. This is a [python decorator](https://www.python.org/dev/peps/pep-0318/) that tells the interpreter that we want this method _abstract_. 

What does all this necessarily mean? Well we can just create a subclass and instantiate it.
```python
class PowerOn(TelevisionButton):
    pass
b = PowerOn()
```
Notice how the syntax of creating a subclass has you pass in the name of the abstract class. Running it, we will ge--
```
TypeError: Can't instantiate abstract class PowerOn with abstract methods press
```
An error? Ah, that's because we told the interpreter that `press(self)` is abstract, and we haven't defined it for our class. Let's fix that, as well as adding code to call the `press` method. The full code should look a little something like this. 
```python
from abc import ABC, abstractmethod

class TelevisionButton(ABC):
    @abstractmethod
    def press(self):
        pass

class PowerOn(TelevisionButton):
    def press(self):
        print('Powering on...')

b = PowerOn()
b.press()
```
Running it once more, we see:
```
Powering on...
```
Sweet! We were able to define an abstract class as well as an abstract method. With that, we made a common interface for all classes, and proved it by making a subclass which has its own class-specific definition of the method. 

This also provided a quick introduction to decorators, which can do a multitude of different things. A common python decorator in object-oriented programming is [@property](https://docs.python.org/3/library/functions.html#property), which gives a clean, safe, and pythonic way of handling properties in classes. This includes, getters, setters, and even deleters (maybe more on that later).

Hope this helps!