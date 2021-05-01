---
layout: post
title: Overview of Regular Expressions
date: 2021-04-30
category: post
---
### Looking at strings
We're going to kick things off by looking into regular expressions -- but before that let's look at data. No, not necessarily like our dive into python's [data classes](https://charlesw.me/2021/04/18/python-dataclasses.html), but rather one representation of data: a string. Strings are, well, a string of characters. Characters can be seen as units of information and are represented as a symbol. The text you see on this screen is done so by [Unicode](https://en.wikipedia.org/wiki/Unicode), which dictates which collection of bits represent what symbols. But I digress, the main thing you should know is that we oftentimes work with these strings in programming. Sometimes we define and declare them on our own, and other times we deal with some external strings. These strings might not be very useful to us as-is, and we might want to do some searching to find and extract the useful bits of data within our hypothetical input string. This brings us to our main topic:

### Regular Expressions
A regular expression (colloquially known as a "regex") is an important tool we can use to change our strings. More specifically, a regex is a group of characters (hint: string) which is used to find a specific pattern in text (again, hint: string). We can use a regex to determine a pattern, matching a string from left to right and ultimately allowing is to find parts of the text that match our regular expression.

This leads to a whole door of opportunity. We can use regular expressions to manipulate text, sure, but we can also use this pattern to make sure strings are compliant of the regex. Say, for example, we make an online game where the user has to enter a username before playing. Let's start simple: we would like our user to have a name with any sequence of letters a-z. No spaces, no special characters like underscores, dashes, slashes, etc. Only any sequence of characters. So let's cook up a regex for that:
```python
[a-z]*
```

### What am I looking at?
A regex, of course! Although it would make a lot more sense to break it down:

* \[ \] - The brackets represent what's called a "character class". A character class matches the character contained within the square brackets.
* a - Match an "a"
* "\-" - Our little hyphen here has a specific meaning in our case. The hyphen indicates a range between the character before it and the character after it. With our regex, that means we match any character within the range of "a" to...
* z - Match a "z"
* \* - Match 0 or more repetitions of the symbol proceeding it.

Putting things together, we can read the following as:

`Match a single character, a-z, with that match occurring 0 or more times.`

Let's give some example on strings that fully match that regex:
* a
* abc
* bbbbbbbbbbbbbbb
* sdmjnfsdlfnsdkjfnwjkl
* 
The last example one is no typo -- the empty string will successfully match the regex. This is due to the asterisk dictating that we match our one and only character class *zero* or more times.

Let's give some examples on strings that _don't_ fully match the regex:
* Abc
* aBBBc
* _aijfnv
* " " <-- pretend that's just one space

In the case of the first three examples, there *are* matches the regex will find on the string (bc, ac, and aijfnv), however they are not complete matches due to having at least one character in the string that does not fall in the range between a-z. Also notice how capital letters will not match, this is because we only defined the range of lowercase letters. If we wanted to include A-Z, we can just add "A-Z". This makes our new regex:

```python
[a-zA-Z]*
```

We can also have it so that the empty string is no longer valid. Meaning the username has to match [a-zA-Z] one or more times. We can do that by changing the asterisk (*) to a plus (+).

```python
[a-zA-Z]+
```

It's also worth mentioning that these characters (the asterisk, plus, as well as the square braces) are called **meta characters**, which is just a fancy way of saying that these characters carry special meaning during our pattern processing. If you ever want the regex to match one of these meta characters, we can precede them with escape characters (backslashes) `\`. Yes, this also means that in order to match the backslash, you have to escape it with a backslash itself `\\`. 

### Other examples of meta characters: Braces, Negations, Periods

Before I wrap things up for now, let's look into other meta characters.

**Braces** - {n,m} - Means to match the preceding symbol any number of times within the range [n,m]. In less math-y terms, match at least "n" repetitions, but also no more than "m" repetitions of the preceding symbol. If we wanted our username to be between 5 and 18 characters, we can have `[a-zA-Z]{5, 15}`

**Negations** - [^ ] - Means to match any character that isn't contained within the braces. 

**Periods** - . - The period in a regex matches any character. The only exception to this is a line break


### Helpful Resources

I know this was a very quick and to-the-point introduction, but now you should be able to have a basic understanding of regular expressions: what they are, how they work, and a few examples of them. What I didn't mention, however, is that there are other meta characters, other use cases of regular expressions, and other examples to go and try out. For that, check out these two links:

* https://github.com/ziishaned/learn-regex
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions

Regular expressions are extremely useful whenever you're looking to manipulate or check large datasets. Definitely keep an eye out for more blogs touching on regex some more, as I also go and learn more about the topic.