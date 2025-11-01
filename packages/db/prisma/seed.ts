import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clean up existing data (optional - comment out if you want to preserve data)
  await prisma.playEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.like.deleteMany();
  await prisma.save.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.report.deleteMany();
  await prisma.reviewTask.deleteMany();
  await prisma.transcript.deleteMany();
  await prisma.clipTag.deleteMany();
  await prisma.clip.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('Creating users...');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@podkiya.com',
      name: 'Admin User',
      bio: 'Platform administrator',
      languagePref: 'en',
    },
  });

  const reviewer1 = await prisma.user.create({
    data: {
      email: 'reviewer1@podkiya.com',
      name: 'Sarah Johnson',
      bio: 'Content reviewer specializing in educational content',
      languagePref: 'en',
    },
  });

  const reviewer2 = await prisma.user.create({
    data: {
      email: 'reviewer2@podkiya.com',
      name: 'أحمد محمد',
      bio: 'مراجع محتوى متخصص في المحتوى العربي',
      languagePref: 'ar',
    },
  });

  const creator1 = await prisma.user.create({
    data: {
      email: 'creator1@podkiya.com',
      name: 'Dr. Emily Chen',
      bio: 'Science educator and podcast creator',
      languagePref: 'en',
    },
  });

  const creator2 = await prisma.user.create({
    data: {
      email: 'creator2@podkiya.com',
      name: 'محمد العلي',
      bio: 'معلم تاريخ ومبدع محتوى تعليمي',
      languagePref: 'ar',
    },
  });

  // Assign roles
  console.log('Assigning roles...');

  await prisma.role.createMany({
    data: [
      { userId: admin.id, role: 'admin' },
      { userId: admin.id, role: 'reviewer' },
      { userId: reviewer1.id, role: 'reviewer' },
      { userId: reviewer2.id, role: 'reviewer' },
      { userId: creator1.id, role: 'creator' },
      { userId: creator2.id, role: 'creator' },
    ],
  });

  // Create tags
  console.log('Creating tags...');

  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        slug: 'science',
        label_en: 'Science',
        label_ar: 'علوم',
      },
    }),
    prisma.tag.create({
      data: {
        slug: 'history',
        label_en: 'History',
        label_ar: 'تاريخ',
      },
    }),
    prisma.tag.create({
      data: {
        slug: 'technology',
        label_en: 'Technology',
        label_ar: 'تكنولوجيا',
      },
    }),
    prisma.tag.create({
      data: {
        slug: 'health',
        label_en: 'Health',
        label_ar: 'صحة',
      },
    }),
    prisma.tag.create({
      data: {
        slug: 'culture',
        label_en: 'Culture',
        label_ar: 'ثقافة',
      },
    }),
    prisma.tag.create({
      data: {
        slug: 'education',
        label_en: 'Education',
        label_ar: 'تعليم',
      },
    }),
    prisma.tag.create({
      data: {
        slug: 'business',
        label_en: 'Business',
        label_ar: 'أعمال',
      },
    }),
    prisma.tag.create({
      data: {
        slug: 'philosophy',
        label_en: 'Philosophy',
        label_ar: 'فلسفة',
      },
    }),
  ]);

  // Create sample clips
  console.log('Creating clips...');

  const clip1 = await prisma.clip.create({
    data: {
      creatorId: creator1.id,
      title: 'The Science of Sleep',
      description: 'A quick dive into why we sleep and what happens during different sleep stages.',
      language: 'en',
      durationSec: 120,
      audioUrl: 'https://example.com/audio/clip1.mp3',
      waveformJsonUrl: 'https://example.com/waveforms/clip1.json',
      thumbUrl: 'https://example.com/thumbnails/clip1.jpg',
      status: 'approved',
      publishedAt: new Date(),
    },
  });

  const clip2 = await prisma.clip.create({
    data: {
      creatorId: creator1.id,
      title: 'Understanding Quantum Computing',
      description: 'Breaking down quantum computing concepts in simple terms.',
      language: 'en',
      durationSec: 150,
      audioUrl: 'https://example.com/audio/clip2.mp3',
      waveformJsonUrl: 'https://example.com/waveforms/clip2.json',
      thumbUrl: 'https://example.com/thumbnails/clip2.jpg',
      status: 'approved',
      publishedAt: new Date(Date.now() - 86400000), // 1 day ago
    },
  });

  const clip3 = await prisma.clip.create({
    data: {
      creatorId: creator2.id,
      title: 'تاريخ الحضارة الإسلامية',
      description: 'نظرة سريعة على العصر الذهبي للحضارة الإسلامية',
      language: 'ar',
      durationSec: 135,
      audioUrl: 'https://example.com/audio/clip3.mp3',
      waveformJsonUrl: 'https://example.com/waveforms/clip3.json',
      thumbUrl: 'https://example.com/thumbnails/clip3.jpg',
      status: 'approved',
      publishedAt: new Date(Date.now() - 172800000), // 2 days ago
    },
  });

  const clip4 = await prisma.clip.create({
    data: {
      creatorId: creator1.id,
      title: 'The Power of Habits',
      description: 'How habits form and how to build better ones.',
      language: 'en',
      durationSec: 140,
      audioUrl: 'https://example.com/audio/clip4.mp3',
      waveformJsonUrl: 'https://example.com/waveforms/clip4.json',
      status: 'in_review',
    },
  });

  const clip5 = await prisma.clip.create({
    data: {
      creatorId: creator2.id,
      title: 'الذكاء الاصطناعي والمستقبل',
      description: 'كيف سيغير الذكاء الاصطناعي حياتنا في المستقبل',
      language: 'ar',
      durationSec: 165,
      audioUrl: 'https://example.com/audio/clip5.mp3',
      waveformJsonUrl: 'https://example.com/waveforms/clip5.json',
      status: 'in_review',
    },
  });

  const clip6 = await prisma.clip.create({
    data: {
      creatorId: creator1.id,
      title: 'Climate Change Basics',
      description: 'Understanding the science behind climate change.',
      language: 'en',
      durationSec: 155,
      audioUrl: 'https://example.com/audio/clip6.mp3',
      waveformJsonUrl: 'https://example.com/waveforms/clip6.json',
      thumbUrl: 'https://example.com/thumbnails/clip6.jpg',
      status: 'approved',
      publishedAt: new Date(Date.now() - 259200000), // 3 days ago
    },
  });

  // Assign tags to clips
  console.log('Assigning tags to clips...');

  await prisma.clipTag.createMany({
    data: [
      { clipId: clip1.id, tagId: tags[0].id }, // Science
      { clipId: clip1.id, tagId: tags[3].id }, // Health
      { clipId: clip2.id, tagId: tags[0].id }, // Science
      { clipId: clip2.id, tagId: tags[2].id }, // Technology
      { clipId: clip3.id, tagId: tags[1].id }, // History
      { clipId: clip3.id, tagId: tags[4].id }, // Culture
      { clipId: clip4.id, tagId: tags[3].id }, // Health
      { clipId: clip4.id, tagId: tags[5].id }, // Education
      { clipId: clip5.id, tagId: tags[2].id }, // Technology
      { clipId: clip5.id, tagId: tags[5].id }, // Education
      { clipId: clip6.id, tagId: tags[0].id }, // Science
      { clipId: clip6.id, tagId: tags[5].id }, // Education
    ],
  });

  // Create transcripts
  console.log('Creating transcripts...');

  await prisma.transcript.createMany({
    data: [
      {
        clipId: clip1.id,
        text: 'Sleep is essential for our bodies and minds. During sleep, our brains consolidate memories, process emotions, and clear out toxins. We cycle through different stages including light sleep, deep sleep, and REM sleep, each serving important functions. Adults need 7-9 hours of quality sleep for optimal health.',
        language: 'en',
        wordsJsonUrl: 'https://example.com/transcripts/clip1-words.json',
      },
      {
        clipId: clip2.id,
        text: 'Quantum computing harnesses the principles of quantum mechanics to process information in fundamentally different ways than classical computers. Unlike traditional bits that are either 0 or 1, quantum bits or qubits can exist in superposition, being both 0 and 1 simultaneously. This allows quantum computers to solve certain problems exponentially faster.',
        language: 'en',
        wordsJsonUrl: 'https://example.com/transcripts/clip2-words.json',
      },
      {
        clipId: clip3.id,
        text: 'شهدت الحضارة الإسلامية عصراً ذهبياً امتد من القرن الثامن إلى القرن الرابع عشر الميلادي. خلال هذه الفترة، ازدهرت العلوم والفنون والفلسفة. أسهم العلماء المسلمون في تطوير الرياضيات والفلك والطب والكيمياء، وترجموا أعمال الفلاسفة اليونانيين وحافظوا عليها.',
        language: 'ar',
        wordsJsonUrl: 'https://example.com/transcripts/clip3-words.json',
      },
      {
        clipId: clip6.id,
        text: 'Climate change refers to long-term shifts in global temperatures and weather patterns. While climate change is natural, human activities since the 1800s have been the main driver, primarily through burning fossil fuels which releases greenhouse gases. These gases trap heat in our atmosphere, leading to rising temperatures, melting ice caps, and more extreme weather events.',
        language: 'en',
        wordsJsonUrl: 'https://example.com/transcripts/clip6-words.json',
      },
    ],
  });

  // Create review tasks
  console.log('Creating review tasks...');

  await prisma.reviewTask.createMany({
    data: [
      {
        clipId: clip4.id,
        reviewerId: reviewer1.id,
        status: 'open',
      },
      {
        clipId: clip5.id,
        reviewerId: reviewer2.id,
        status: 'open',
      },
    ],
  });

  // Create some social interactions
  console.log('Creating social interactions...');

  await prisma.like.createMany({
    data: [
      { userId: reviewer1.id, clipId: clip1.id },
      { userId: reviewer2.id, clipId: clip1.id },
      { userId: admin.id, clipId: clip1.id },
      { userId: reviewer1.id, clipId: clip2.id },
      { userId: admin.id, clipId: clip3.id },
    ],
  });

  await prisma.save.createMany({
    data: [
      { userId: reviewer1.id, clipId: clip1.id },
      { userId: admin.id, clipId: clip2.id },
    ],
  });

  await prisma.follow.createMany({
    data: [
      { followerId: reviewer1.id, followingUserId: creator1.id },
      { followerId: reviewer2.id, followingUserId: creator2.id },
      { followerId: admin.id, followingUserId: creator1.id },
      { followerId: admin.id, followingUserId: creator2.id },
    ],
  });

  // Create play events
  console.log('Creating play events...');

  await prisma.playEvent.createMany({
    data: [
      {
        clipId: clip1.id,
        userId: reviewer1.id,
        c30: true,
        c60: true,
        c90: true,
        completed: true,
      },
      {
        clipId: clip1.id,
        userId: reviewer2.id,
        c30: true,
        c60: true,
        c90: false,
        completed: false,
      },
      {
        clipId: clip2.id,
        userId: admin.id,
        c30: true,
        c60: true,
        c90: true,
        completed: true,
      },
      {
        clipId: clip3.id,
        userId: admin.id,
        c30: true,
        c60: false,
        c90: false,
        completed: false,
      },
      {
        clipId: clip6.id,
        userId: reviewer1.id,
        c30: true,
        c60: true,
        c90: true,
        completed: true,
      },
    ],
  });

  console.log('Seed completed successfully!');
  console.log('\nCreated:');
  console.log('- 5 users (1 admin, 2 reviewers, 2 creators)');
  console.log('- 8 tags');
  console.log('- 6 clips (3 approved, 2 in review, 1 draft)');
  console.log('- 4 transcripts');
  console.log('- 2 review tasks');
  console.log('- Social interactions (likes, saves, follows)');
  console.log('- Play events');
  console.log('\nTest credentials:');
  console.log('Admin: admin@podkiya.com');
  console.log('Reviewer 1: reviewer1@podkiya.com');
  console.log('Reviewer 2: reviewer2@podkiya.com');
  console.log('Creator 1: creator1@podkiya.com');
  console.log('Creator 2: creator2@podkiya.com');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
