# Word of the Day MCP Server

A Model Context Protocol (MCP) server that provides word definitions and random word-of-the-day functionality using the amazing **[Free Dictionary API](https://api.dictionaryapi.dev/)**! 🎉

## 🙏 Special Thanks

Huge shoutout to the **[Free Dictionary API](https://www.dictionaryapi.dev/)** team for providing this incredible, free, and open-source dictionary service! This project wouldn't be possible without their fantastic API that delivers comprehensive word definitions, pronunciations, examples, and more. 

**API Endpoint:** `https://api.dictionaryapi.dev/api/v2/entries/en/<word>`

## Features

- **Get Word Definition**: Fetch comprehensive definitions, pronunciations, meanings, and examples for any English word
- **Random Word of the Day**: Get a random word with its definition, categorized by difficulty level
- **Rich Information**: Includes phonetic pronunciation, part of speech, examples, synonyms, antonyms, and etymology when available

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## Usage

### As an MCP Server

The server is configured to run via the MCP protocol. Add it to your MCP client configuration:

```json
{
  "mcpServers": {
    "word-of-the-day": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/Word_of_the_day"
    }
  }
}
```

### Available Tools

#### 1. `get_word_definition`
Get the definition, pronunciation, and meanings of a word.

**Parameters:**
- `word` (required): The word to get the definition for
- `language` (optional): Language code (default: "en")

**Example:**
```json
{
  "name": "get_word_definition",
  "arguments": {
    "word": "serendipity"
  }
}
```

#### 2. `get_random_word`
Get a random word with its definition for word of the day.

**Parameters:**
- `difficulty` (optional): Difficulty level - "easy", "medium", or "hard" (default: "medium")

**Example:**
```json
{
  "name": "get_random_word",
  "arguments": {
    "difficulty": "hard"
  }
}
```

## 📚 API Integration

This server integrates with the **[Free Dictionary API](https://api.dictionaryapi.dev/)** - a completely free, open-source dictionary API that requires no authentication! 

### Why We Love This API:
- ✅ **Completely FREE** - No API keys or rate limits
- ✅ **Open Source** - Community-driven project
- ✅ **Comprehensive Data** - Rich word information
- ✅ **No Authentication** - Just make requests and get data!

The API provides:

- Word definitions and meanings
- Phonetic pronunciations (text and audio)
- Part of speech information
- Usage examples
- Synonyms and antonyms
- Etymology/origin information

## Word Difficulty Levels

- **Easy**: Common everyday words (happy, house, water, etc.)
- **Medium**: More sophisticated vocabulary (serendipity, eloquent, resilient, etc.)
- **Hard**: Advanced vocabulary (ephemeral, ubiquitous, perspicacious, etc.)

## Development

- **Development mode**: `npm run dev`
- **Build**: `npm run build`
- **Start**: `npm start`

## Example Response

When you request the definition of "hello", you'll get:

```
**hello**

**Pronunciation:** həˈləʊ, hɛˈləʊ

**Origin:** early 19th century: variant of earlier hollo ; related to holla.

**Meanings:**

1. **exclamation**
   1. used as a greeting or to begin a phone conversation.
      *Example: "hello there, Katie!"*

2. **noun**
   1. an utterance of 'hello'; a greeting.
      *Example: "she was getting polite nods and hellos from people"*

3. **verb**
   1. say or shout 'hello'.
      *Example: "I pressed the phone button and helloed"*

**Audio Pronunciation:**
1. //ssl.gstatic.com/dictionary/static/sounds/20200429/hello--_gb_1.mp3
```

## Error Handling

The server gracefully handles:
- Words not found in the dictionary
- API connection issues
- Invalid parameters
- Network timeouts

## License

This project is open source and available under the MIT License.
