#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Dictionary API response types
interface PhoneticInfo {
  text: string;
  audio?: string;
}

interface Definition {
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
}

interface WordEntry {
  word: string;
  phonetic?: string;
  phonetics: PhoneticInfo[];
  origin?: string;
  meanings: Meaning[];
}

// Validation schemas
const GetDefinitionArgsSchema = z.object({
  word: z.string().min(1, 'Word cannot be empty'),
  language: z.string().default('en').optional(),
});

const GetRandomWordArgsSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium').optional(),
});

class WordOfTheDayServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'word-of-the-day-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_word_definition',
            description: 'Get the definition, pronunciation, and meanings of a word using the Dictionary API',
            inputSchema: {
              type: 'object',
              properties: {
                word: {
                  type: 'string',
                  description: 'The word to get the definition for',
                },
                language: {
                  type: 'string',
                  description: 'Language code (default: en)',
                  default: 'en',
                },
              },
              required: ['word'],
            },
          },
          {
            name: 'get_random_word',
            description: 'Get a random word with its definition for word of the day',
            inputSchema: {
              type: 'object',
              properties: {
                difficulty: {
                  type: 'string',
                  enum: ['easy', 'medium', 'hard'],
                  description: 'Difficulty level of the random word',
                  default: 'medium',
                },
              },
              required: [],
            },
          },
        ] satisfies Tool[],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_word_definition':
            return await this.getWordDefinition(args);
          case 'get_random_word':
            return await this.getRandomWord(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
        };
      }
    });
  }

  private async getWordDefinition(args: unknown) {
    const { word, language = 'en' } = GetDefinitionArgsSchema.parse(args);
    
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/${language}/${encodeURIComponent(word)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return {
            content: [
              {
                type: 'text',
                text: `No definition found for "${word}". Please check the spelling or try a different word.`,
              },
            ],
          };
        }
        throw new Error(`Dictionary API error: ${response.status} ${response.statusText}`);
      }

      const data: WordEntry[] = await response.json();
      
      if (!data || data.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No definition found for "${word}".`,
            },
          ],
        };
      }

      const entry = data[0];
      let result = `**${entry.word}**\n\n`;
      
      // Add phonetic information
      if (entry.phonetic) {
        result += `**Pronunciation:** ${entry.phonetic}\n\n`;
      } else if (entry.phonetics && entry.phonetics.length > 0) {
        const phoneticTexts = entry.phonetics
          .filter(p => p.text)
          .map(p => p.text)
          .join(', ');
        if (phoneticTexts) {
          result += `**Pronunciation:** ${phoneticTexts}\n\n`;
        }
      }

      // Add origin if available
      if (entry.origin) {
        result += `**Origin:** ${entry.origin}\n\n`;
      }

      // Add meanings
      result += `**Meanings:**\n\n`;
      entry.meanings.forEach((meaning, index) => {
        result += `${index + 1}. **${meaning.partOfSpeech}**\n`;
        meaning.definitions.forEach((def, defIndex) => {
          result += `   ${defIndex + 1}. ${def.definition}\n`;
          if (def.example) {
            result += `      *Example: "${def.example}"*\n`;
          }
          if (def.synonyms && def.synonyms.length > 0) {
            result += `      *Synonyms: ${def.synonyms.join(', ')}*\n`;
          }
          if (def.antonyms && def.antonyms.length > 0) {
            result += `      *Antonyms: ${def.antonyms.join(', ')}*\n`;
          }
        });
        result += '\n';
      });

      // Add audio pronunciation links if available
      const audioLinks = entry.phonetics
        .filter(p => p.audio)
        .map(p => p.audio)
        .filter(Boolean);
      
      if (audioLinks.length > 0) {
        result += `**Audio Pronunciation:**\n`;
        audioLinks.forEach((audio, index) => {
          result += `${index + 1}. ${audio}\n`;
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to fetch definition for "${word}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getRandomWord(args: unknown) {
    const { difficulty = 'medium' } = GetRandomWordArgsSchema.parse(args);
    
    // List of curated words by difficulty level
    const wordLists = {
      easy: [
        'happy', 'house', 'water', 'light', 'music', 'friend', 'smile', 'peace', 
        'dream', 'heart', 'love', 'hope', 'time', 'life', 'world', 'nature'
      ],
      medium: [
        'serendipity', 'eloquent', 'resilient', 'magnificent', 'innovative', 
        'perspective', 'authentic', 'curiosity', 'adventure', 'harmony', 
        'wisdom', 'courage', 'gratitude', 'compassion', 'creativity', 'balance'
      ],
      hard: [
        'ephemeral', 'ubiquitous', 'perspicacious', 'surreptitious', 'magnanimous',
        'obfuscate', 'ameliorate', 'propensity', 'vicissitude', 'perspicuity',
        'sesquipedalian', 'grandiloquent', 'pusillanimous', 'truculent', 'recalcitrant'
      ]
    };

    const words = wordLists[difficulty];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    
    // Get the definition for the random word
    return await this.getWordDefinition({ word: randomWord, language: 'en' });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Word of the Day MCP server running on stdio');
  }
}

const server = new WordOfTheDayServer();
server.run().catch(console.error);
