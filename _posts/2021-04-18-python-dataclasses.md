---
layout: post
title: Python Data Classes and Type Hinting
date: 2021-04-18
category: post
---
### Ways to Store Data
In the same spirit of last week, we will take a plunge into another piece of what Python has to offer. This time, we'll be looking into data. More specifically, how we can structure and arrange data, and how we can *classify data* in ways that allows us to compare, contrast, hash, and represent them against each other.

Say we have a program that parses Movie data from an external API, and we want to process the data and render it on some website. There's different ways to go about this, but for now we probably want to focus on what we can and want to take from each listing. Say a movie listing consists of a title, an ID, genre, and average rating (out of five stars). We might want a class to represent each movie:

```python
class MovieItem:
    def __init__(self, id_: int, title: str, genre: str, rating: int):
        self.id_ = id_
        self.title = title
        self.genre = genre
        self.rating = rating
```

### Type Hints
Looking at this small snippet, you might ask yourself what all this stuff is I declared under the `__init__` parameters. These are called [type hints](https://docs.python.org/3/library/typing.html), and they are a means to annotate a type to functions and variables. Note that I say *annotate*, not something like enforce. Type hints in Python will not throw errors or exceptions if they are misused, and you should always err on the side of caution and ensure you are always using the right types in the proper places (third party tools e.g. linters, IDEs, etc are fair game for enforcing type hints, however). Nonetheless, type hints are a great way to document what types your functions, methods, and variables hold.

### Expanding our Class, and Why Dataclasses Rule
Now that we have our basic `MovieItem` class, we should look into ways we can manipulate and manage numerous instances of this class. Since we want to render this information on a website in this hypothetical scenario, maybe our website would like to render our data in order of id, or maybe the API we get our data from has duplicate entries? It's even possible that we want to consider other parameters in our class in the future, which can lead to some refactoring, especially if we already implemented [dunder methods](https://docs.python.org/3/reference/datamodel.html#basic-customization) such as \_\_lt\_\_, \_\_gt\_\_, and many more. 

This is where [dataclasses](https://docs.python.org/3/library/dataclasses.html#dataclasses.dataclass) come into play. This native Python library comes with some neat features that do a lot of heavy lifting for us. One of these features include a decorator `@dataclass` that adds generated methods automatically. Let's take a look at how we might turn our class into a dataclass:
```python
from dataclasses import dataclass

@dataclass(order=True)
class MovieItem:
    id_: int
    title: str
    genre: str
    rating: int
```

This leaves us with a nice, clean syntax as shown above. It's also worth noting that `order=True` generates dunder methods that check for comparison, so we can sort a list of MovieItem objects. Sorting is done by comparing tuples of the object's fields (id_, title, genre, string). We can also instantiate a MovieItem by doing:
```python
movie_item = MovieItem(1, "some title", "fantasy", 5)
```

Let's go ahead an instantiate another object. Adding in another instance of our dataclass, our code should look a little something like this: 
```python
from dataclasses import dataclass

@dataclass(order=True)
class MovieItem:
    id_: int
    title: str
    genre: str
    rating: int

movie_item = MovieItem(1, "some title", "fantasy", 5)
another_movie_item = MovieItem(0, "another title", "adventure", 3)
```

From here, we could do operations like sorting, hashing, and many more. We can take a list of MovieItem objects, sort them, and then render them, in which they would be sorted by id first, then title, then genre, then rating. Of course, you can implement other methods that sort by different fields, but given what dataclasses give us out of the box, a lot of progress has been made!