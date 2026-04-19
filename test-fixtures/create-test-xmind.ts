import JSZip from 'jszip';
import { writeFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';

async function main() {
  await mkdir('test-fixtures', { recursive: true });

  const zip = new JSZip();

  const content = [
    {
      id: 'sheet-1',
      class: 'sheet',
      title: 'Sheet 1',
      rootTopic: {
        id: 'root-1',
        title: 'XMind Test Root',
        children: {
          attached: [
            {
              id: 'topic-1',
              title: 'Branch A',
              notes: { plain: { content: 'This is a note on Branch A' } },
              labels: ['important', 'review'],
              children: {
                attached: [
                  { id: 'topic-1-1', title: 'Sub-item A.1' },
                  { id: 'topic-1-2', title: 'Sub-item A.2', href: 'https://example.com' },
                ],
              },
            },
            {
              id: 'topic-2',
              title: 'Branch B',
              children: {
                attached: [
                  { id: 'topic-2-1', title: 'Sub-item B.1' },
                  {
                    id: 'topic-2-2',
                    title: 'Sub-item B.2',
                    children: {
                      attached: [
                        { id: 'topic-2-2-1', title: 'Deep item B.2.1' },
                      ],
                    },
                  },
                ],
              },
            },
            {
              id: 'topic-3',
              title: 'Branch C (leaf)',
            },
          ],
        },
      },
    },
  ];

  const metadata = {
    creator: { name: 'test-script' },
    createdTime: new Date().toISOString(),
  };

  const manifest = {
    'file-entries': {
      'content.json': {},
      'metadata.json': {},
    },
  };

  zip.file('content.json', JSON.stringify(content, null, 2));
  zip.file('metadata.json', JSON.stringify(metadata, null, 2));
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  const buffer = await zip.generateAsync({ type: 'nodebuffer' });
  await writeFile('test-fixtures/test.xmind', buffer);

  console.log('Created test-fixtures/test.xmind');
}

main().catch(console.error);
