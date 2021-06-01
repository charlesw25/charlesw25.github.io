---
layout: post
title: C++ Templates
date: 2021-06-01
category: post
---
After a nice break, I decided there would be no better way to make a return post by doing something different. More specifically, let's talk about one of the neat things you can do in C++.

### Templates
Templates are a means of creating functions or classes that deal with generic types. In this post, we're going to briefly touch on template classes, and how they can be used.

Let's just jump right into it and make a template class. In this example, I will make a singly linked list node class.

```c++
#include <iostream>

template <class T>
class ll_Node{
  T data;
public:
  ll_Node *next;
  ll_Node(T in_data) {
    data = in_data;
  }
};
```

We have a few things going on here, so let's start from the top and trickle down to the bottom:

* `template <class T>` is how we declare a template, be it a function or class template.
* Because of our template declaration, we can define a generic type `T data;`
* We also see this being referenced in the parameter of our `ll_Node` constructor: `T in_data`.

All are neat stuff. But let's actually get things going in practice. Firstly, we'll need to make a method that retrieves our data, since we made our data field private:
```c++
#include <iostream>

template <class T>
class ll_Node{
  T data;
public:
  ll_Node *next;
  ll_Node(T in_data) {
    data = in_data;
  }
  T getData();
};

template<class T>
T ll_Node<T>::getData() {
  return data;
}
```

We can now see something different. When we declare our function, we see that we also have to include the type of `ll_Node` that this function covers. Since we're still dealing with generics of type T, then we go ahead and use `ll_Node<T>` as our prefix.

Let's actually instantiate some examples and put our `main` function to use:
```c++
int main(){
  ll_Node<int> head_int = (1);
  ll_Node<const char*> head_str = ("some data");

  std::cout << "We have some data: " << head_int.getData() << std::endl;
  std::cout << "We have some data: " << head_str.getData() << std::endl;
}
```

Let's get some easy pickings out of the way. We know that if we were to run the full code, we will have 
```c++
We have some data: 1
We have some data: some data
```
written to STDOUT. We also see that we initialized two `ll_Node` objects `head_int` and `head_str`. What's neat here, however, is that we still explicitly mention what type of `ll_Node` we want -- and we have two examples already written. If we wanted, we could've used a `char`, `float`, `short`, et cetera.


Hope you learned something new today. If you want to know more about templates and its other uses, check out this link [here](https://www.cplusplus.com/doc/oldtutorial/templates/).