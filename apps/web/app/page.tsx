export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <h1 className="text-6xl font-bold tracking-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Podkiya
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover and share bite-sized educational audio clips. Learn something new in just 1-3 minutes.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-lg border bg-card">
              <div className="text-4xl mb-4">🎧</div>
              <h3 className="text-lg font-semibold mb-2">Quick Learning</h3>
              <p className="text-sm text-muted-foreground">
                Audio clips designed to fit into your busy schedule
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-lg font-semibold mb-2">Multilingual</h3>
              <p className="text-sm text-muted-foreground">
                Content in English, Arabic, and more languages
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-lg font-semibold mb-2">Quality Content</h3>
              <p className="text-sm text-muted-foreground">
                All clips reviewed by experts before publishing
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mt-12">
            <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">
              Explore Clips
            </button>
            <button className="px-8 py-3 border rounded-lg font-medium hover:bg-accent transition">
              Learn More
            </button>
          </div>

          {/* Status Info */}
          <div className="mt-16 p-6 rounded-lg bg-muted/50 border">
            <h3 className="text-lg font-semibold mb-2">🚀 Development Status</h3>
            <p className="text-sm text-muted-foreground">
              Backend infrastructure is complete! Frontend UI is being implemented.
              <br />
              <span className="text-xs">Check out the{' '}
                <a href="https://github.com/issaalbalushi/podkiya-claude" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  GitHub repository
                </a>
                {' '}for implementation progress.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
