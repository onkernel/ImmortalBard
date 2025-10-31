import { ImmortalBard } from '../src/index';

async function main() {
  // Initialize ImmortalBard (uses env vars or pass keys as constructor params)
  const bard = new ImmortalBard();

  try {
    // Set the scene - configure the AI provider
    console.log('Setting the scene...');
    await bard.scene({ provider: 'anthropic' });

    // Enter the stage - launch a browser session
    console.log('Entering the stage...');
    await bard.toBe();

    // Beseech the bard with natural language commands
    console.log('\nNavigating to fandom.com...');
    let result = await bard.beseech('Navigate to https://fandom.com');
    console.log('Generated code:', result.code);
    console.log('Returned data:', result.result);
    if (result.error) console.error('Error:', result.error);
    console.log('\nSearching for Gojo...');
    result = await bard.beseech(
      'Type "Gojo" in the search box and press enter', 
      {
        timeout: 120
      }
    );
    console.log('Generated code:', result.code);
    console.log('Returned data:', result.result);
    if (result.error) console.error('Error:', result.error);

    console.log('\nExtracting first result...');
    result = await bard.beseech('Tell me the title of the first search result');
    console.log('Generated code:', result.code);
    console.log('Returned data:', result.result);
    if (result.error) console.error('Error:', result.error);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
