require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { faker } = require('@faker-js/faker');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  try {
    console.log('🌱 Seeding Winform database with test data...');

    // Create test users
    const users = [];
    for (let i = 0; i < 5; i++) {
      const user = {
        email: faker.internet.email(),
        nom: faker.person.fullName(),
        role: i === 0 ? 'admin' : 'user',
        plan: i === 0 ? 'premium' : 'free',
        forms_created: 0,
        forms_limit: i === 0 ? 999 : 2
      };

      const { data: createdUser, error } = await supabase
        .from('users')
        .insert(user)
        .select()
        .single();

      if (error) {
        console.error('Failed to create user:', error);
        continue;
      }

      users.push(createdUser);
      console.log(`✅ Created user: ${createdUser.email}`);
    }

    // Create test forms
    const forms = [];
    for (const user of users) {
      if (user.role === 'admin' || user.plan === 'premium') {
        for (let i = 0; i < (user.role === 'admin' ? 3 : 1); i++) {
          const form = {
            titre: faker.lorem.words(3),
            description: faker.lorem.sentence(),
            admin_id: user.id,
            fields: [
              { type: 'text', label: 'Nom complet', required: true },
              { type: 'email', label: 'Email', required: true },
              { type: 'textarea', label: 'Description', required: true },
              { type: 'select', label: 'Niveau', options: ['Débutant', 'Intermédiaire', 'Avancé'] }
            ],
            scoring_criteria: {
              relevance: 0.4,
              completeness: 0.3,
              clarity: 0.2,
              originality: 0.1
            }
          };

          const { data: createdForm, error } = await supabase
            .from('forms')
            .insert(form)
            .select()
            .single();

          if (error) {
            console.error('Failed to create form:', error);
            continue;
          }

          forms.push(createdForm);
          console.log(`✅ Created form: ${createdForm.titre} by ${user.email}`);

          // Update user forms count
          await supabase
            .from('users')
            .update({ forms_created: user.forms_created + 1 })
            .eq('id', user.id);
        }
      }
    }

    // Create test responses
    const responses = [];
    for (const form of forms) {
      for (let i = 0; i < 3; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const response = {
          form_id: form.id,
          user_id: user.id,
          contenu: {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            description: faker.lorem.paragraphs(2),
            level: faker.helpers.arrayElement(['Débutant', 'Intermédiaire', 'Avancé'])
          }
        };

        const { data: createdResponse, error } = await supabase
          .from('responses')
          .insert(response)
          .select()
          .single();

        if (error) {
          console.error('Failed to create response:', error);
          continue;
        }

        responses.push(createdResponse);
        console.log(`✅ Created response for form: ${form.titre}`);

        // Create test scores
        const score = {
          response_id: createdResponse.id,
          valeur: Math.floor(Math.random() * 80) + 20, // 20-100
          seuil: 70,
          feedback: faker.lorem.sentence(),
          ai_model: 'deepseek/deepseek-chat'
        };

        await supabase
          .from('scores')
          .insert(score);

        console.log(`✅ Created score: ${score.valeur}/100 for response`);
      }
    }

    console.log('🎉 Database seeding completed!');
    console.log(`📊 Summary: ${users.length} users, ${forms.length} forms, ${responses.length} responses`);

    return true;
  } catch (error) {
    console.error('❌ Seeding error:', error);
    return false;
  }
}

// Run seeding
seedDatabase()
  .then(success => {
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });