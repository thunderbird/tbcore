#Thunderbird Core Contributor Analysis

This is a node.js project, intended to be run on a local user's directory, than be used to analyze contributions to Thunderbird code over a period of time. The unit of measure is a change to a file in a single hg repository.

There are various constants set in the code which will need to be varied for each use.

To run:

1)	Install node.js
2)	Clone or download this repository to a directory, and switch to that directory.

3)	run using:
```bash
node index.js
```

The program will print out various versions of the list of contributors. The last sorts contributors by total contributions to Thunderbird.