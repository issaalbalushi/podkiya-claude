import { serve } from 'inngest/express';
import express from 'express';
import { inngest } from './client';
import {
  processClip,
  retryClipProcessing,
  updateClipIndex,
  removeClipFromIndex,
} from './functions/process-clip';

const app = express();
const port = process.env.PORT || 3001;

// Inngest endpoint
app.use(
  '/api/inngest',
  serve({
    client: inngest,
    functions: [
      processClip,
      retryClipProcessing,
      updateClipIndex,
      removeClipFromIndex,
    ],
  })
);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'podkiya-jobs' });
});

app.listen(port, () => {
  console.log(`Jobs server running on http://localhost:${port}`);
  console.log(`Inngest endpoint: http://localhost:${port}/api/inngest`);
});
