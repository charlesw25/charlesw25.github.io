---
layout: post
title: Regular Expressions in Python
date: 2021-05-08
category: post
---
### Back to Python
Last time, we glossed over some of the basics of [Regular Expressions](https://charlesw.me/2021/04/30/regular-expressions.html). This time, we will go over how regular expressions are used in Python, as well as discussing some of the finer intricacies when talking about matching text.

### Beginning and End
One thing discussed last week were how running regular expressions against an input can have a "match", and how that doesn't necessarily mean the entire input string matches that expression. Going to our previous example of a regex `[a-z]*` and input `Abc`, we know that matches occur where there are zero or more occurrences of any letter a-z -- however that doesn't mean the entire input `Abc` is a match. As a matter of fact, `Abc` is not a match as we discussed. So what if we want to have a regex that checks in relation to the entire input?

That's where `^` and `$` come in. The carrot symbol indicates the beginning of the input, while the dollar sign indicates the end of the input. Now if we took our example and added those symbols, giving us `^[a-z]*$`, then running `Abc` would yield zero matches. Ths is because our regex is another way of saying "from the start of the line to the end, match zero or more instances of `a-z`". As we can tell from the input, the first character is not an instance of `a-z`, so this fails automatically as now we're checking the *entire* input with this regex.

### Regex in Python and the `re` Library
With that out of the way, let's actually go and use regular expressions in Python. All great things in the world of Python start with some form of an import. In our case, we'd want to `import re`. From here, let's discuss one of the key functions this package provide:

```python
re.search(pattern, string, flags=0)
```

As you can tell, this method will allow us to search an input string against a regular expression (known as a pattern). There are also optional flags you can pass in, with multiple flags being added together by use of the bitwise or `|` symbol. Some examples of flags include `re.I` (ignore case) and `re.M` multi-line -- and we can pass them in to this search method as:
`flags=re.I|re.M`.

The search method in question will return a match object to the first instance a match is found in the string, otherwise, the method will return `None`. Something of slight importance, the match object is an object defined in the `re` library, and is not part of the native python library.

Enough talk, let's see it in action. We will be using the same example as before:
```python
import re

pattern = "^[a-z]*$"
s = "Abc"

match = re.search(pattern, s)

print(match)
```

Running this code will give us `None`, as the input string `s` has no matches against the pattern `^[a-z]*$`. Now if we changed `s` to `abcdefg`, we would get `<_sre.SRE_Match object; span=(0, 7), match='abcdefg'>`.

Now let's do away with the carrot and dollar sign, running `abc12fg` against `[a-z]*` with this code will give us `<_sre.SRE_Match object; span=(0, 3), match='abc'>`.

Same deal as our last example, but we have our input as `123`. This yields us `<_sre.SRE_Match object; span=(0, 0), match=''>`. Why? Because of our regex being `[a-z]*` (having no `^/$` as well as matching "0 or more instances of a-z"), we can consider the empty string. Hopefully now you get the idea.


### Getting Creative with Regex
Let's start being practical with regular expressions here. Say we have a random list of filenames that follow this format:
`"[random string of lowercase letters with length randing from 3-15]-id.txt"`:
```python
filenames = [
    "yqa-id.txt",
    "ddfbjwoeyzrmrp-id.txt",
    "gmbtpsaz-id.txt",
    "nwnwbrjwaig-id.txt",
    "asbfsouqwkfmrx-id.txt",
    "een-id.txt",
    "bagrqtqevtcv-id.txt",
    "miij-id.txt",
    "khouhv-id.txt",
    "oawelbt-id.txt",
    "vsu-id.txt",
    "tshksipu-id.txt",
    "idfcycdywkamgqy-id.txt",
    "mrwjmhyprain-id.txt",
    "rgkqdldzjyekzi-id.txt",
    "rwzjvjzsy-id.txt",
    "nzmzcvhpvnq-id.txt",
    "mxoxtbyujxdkls-id.txt",
    "tcxpniiil-id.txt",
    "wyrtchlbawgxa-id.txt"
]
```

Now we want to extract the those random strings themselves via. regex. Since we already know and see the format, we can construct a regex of our own and grab the matches -- which can be `[a-z]*`:
```python
import re

filenames = [
    "yqa-id.txt",
    "ddfbjwoeyzrmrp-id.txt",
    "gmbtpsaz-id.txt",
    "nwnwbrjwaig-id.txt",
    "asbfsouqwkfmrx-id.txt",
    "een-id.txt",
    "bagrqtqevtcv-id.txt",
    "miij-id.txt",
    "khouhv-id.txt",
    "oawelbt-id.txt",
    "vsu-id.txt",
    "tshksipu-id.txt",
    "idfcycdywkamgqy-id.txt",
    "mrwjmhyprain-id.txt",
    "rgkqdldzjyekzi-id.txt",
    "rwzjvjzsy-id.txt",
    "nzmzcvhpvnq-id.txt",
    "mxoxtbyujxdkls-id.txt",
    "tcxpniiil-id.txt",
    "wyrtchlbawgxa-id.txt"
]


pattern = "[a-z]*"
for name in filenames:
    match = re.search(pattern, name)
    if match:
        print(match.group())
```
Which gives us:
```
yqa
ddfbjwoeyzrmrp
gmbtpsaz
nwnwbrjwaig
asbfsouqwkfmrx
een
bagrqtqevtcv
miij
khouhv
oawelbt
vsu
tshksipu
idfcycdywkamgqy
mrwjmhyprain
rgkqdldzjyekzi
rwzjvjzsy
nzmzcvhpvnq
mxoxtbyujxdkls
tcxpniiil
wyrtchlbawgxa
```

Now of course, we can also play around with this a bit, and match those with names between three and six characters long. Since we also know the format of the filename, we can also leverage that to make sure we match names within the proper range -- in other words, make sure that we don't match just the first 3-6 letters for a name whose length doesn't fall in that exact range. 
```python
import re

filenames = [
    "yqa-id.txt",
    "ddfbjwoeyzrmrp-id.txt",
    "gmbtpsaz-id.txt",
    "nwnwbrjwaig-id.txt",
    "asbfsouqwkfmrx-id.txt",
    "een-id.txt",
    "bagrqtqevtcv-id.txt",
    "miij-id.txt",
    "khouhv-id.txt",
    "oawelbt-id.txt",
    "vsu-id.txt",
    "tshksipu-id.txt",
    "idfcycdywkamgqy-id.txt",
    "mrwjmhyprain-id.txt",
    "rgkqdldzjyekzi-id.txt",
    "rwzjvjzsy-id.txt",
    "nzmzcvhpvnq-id.txt",
    "mxoxtbyujxdkls-id.txt",
    "tcxpniiil-id.txt",
    "wyrtchlbawgxa-id.txt"
]


pattern = "^[a-z]{3,6}-"
for name in filenames:
    match = re.search(pattern, name)
    if match:
        print(match.group()[:-1])
```
Which will yield:
```
yqa
een
miij
khouhv
vsu
```

Notice how I added the carrot to indicate we only start counting matches from the start of the input. From there, we match 3-6 lowercase letters, and then add the `-` to know that at this point our name should end here. We also have to trim the last character (`-`) as we included it in our regex to match.

Now we looked at some examples of how we can use regular expressions in Python. Definitely take some time to look into other uses for regex -- maybe even see if your text editor or IDE supports regex!