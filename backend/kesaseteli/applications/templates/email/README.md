<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Email templates](#email-templates)
  - [Template file structure](#template-file-structure)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Email templates

This directory contains email templates used in the Kesäseteli application.
The templates are lightly structured files instead of plain HTML.

## Template file structure

Each template `<email type>_<language>.html` file in this directory follows a simple structure:
1. Email subject line
2. Blank line
3. Email body Django template