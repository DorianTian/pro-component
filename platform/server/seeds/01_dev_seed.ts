import type { Knex } from 'knex'
import bcrypt from 'bcryptjs'

/**
 * Dev seed data for all tables.
 * Seed functions are declarative data — exempt from the 50-line rule.
 */
export async function seed(knex: Knex): Promise<void> {
  // Clean all tables in reverse FK order
  await knex('version_events').del()
  await knex('compat_results').del()
  await knex('grayscale_rules').del()
  await knex('app_version_maps').del()
  await knex('versions').del()
  await knex('apps').del()
  await knex('packages').del()
  await knex('platform_users').del()

  // --- Platform Users ---
  const adminKeyHash = await bcrypt.hash('admin-api-key-dev', 10)
  const publisherKeyHash = await bcrypt.hash('publisher-api-key-dev', 10)
  const operatorKeyHash = await bcrypt.hash('operator-api-key-dev', 10)

  await knex('platform_users').insert([
    { username: 'admin', role: 'admin', api_key_hash: adminKeyHash },
    { username: 'ci-bot', role: 'publisher', api_key_hash: publisherKeyHash },
    { username: 'ops-user', role: 'operator', api_key_hash: operatorKeyHash },
    { username: 'viewer-user', role: 'viewer', api_key_hash: null },
  ])

  // --- Packages ---
  const [proTableId] = await knex('packages').insert({
    name: '@pro/table',
    description: 'ProTable component for Vue 3 + Element Plus',
    latest_version: '1.2.3',
  })
  const [proFormId] = await knex('packages').insert({
    name: '@pro/form',
    description: 'ProForm component for Vue 3 + Element Plus',
    latest_version: '1.1.2',
  })
  const [proHooksId] = await knex('packages').insert({
    name: '@pro/hooks',
    description: 'Shared composables',
    latest_version: '1.2.0',
  })
  const [proUtilsId] = await knex('packages').insert({
    name: '@pro/utils',
    description: 'Shared utilities',
    latest_version: '1.0.3',
  })

  // --- Versions ---
  await knex('versions').insert([
    {
      package_id: proTableId,
      version: '1.2.3',
      dependencies: JSON.stringify({ '@pro/hooks': '^1.2.0', '@pro/utils': '^1.0.0' }),
      peer_dependencies: JSON.stringify({ vue: '>=3.4.0', 'element-plus': '>=2.9.0' }),
      cdn_path: '/@pro/table/1.2.3',
      sri_hashes: JSON.stringify({ 'esm/index.mjs': 'sha384-fakeHashTable123' }),
      status: 'published',
    },
    {
      package_id: proTableId,
      version: '1.2.2',
      dependencies: JSON.stringify({ '@pro/hooks': '^1.1.0', '@pro/utils': '^1.0.0' }),
      peer_dependencies: JSON.stringify({ vue: '>=3.4.0', 'element-plus': '>=2.9.0' }),
      cdn_path: '/@pro/table/1.2.2',
      sri_hashes: JSON.stringify({ 'esm/index.mjs': 'sha384-fakeHashTable122' }),
      status: 'published',
    },
    {
      package_id: proFormId,
      version: '1.1.2',
      dependencies: JSON.stringify({ '@pro/hooks': '^1.1.0', '@pro/utils': '^1.0.0' }),
      peer_dependencies: JSON.stringify({ vue: '>=3.4.0', 'element-plus': '>=2.9.0' }),
      cdn_path: '/@pro/form/1.1.2',
      sri_hashes: JSON.stringify({ 'esm/index.mjs': 'sha384-fakeHashForm112' }),
      status: 'published',
    },
    {
      package_id: proHooksId,
      version: '1.2.0',
      dependencies: JSON.stringify({ '@pro/utils': '^1.0.0' }),
      peer_dependencies: JSON.stringify({ vue: '>=3.4.0' }),
      cdn_path: '/@pro/hooks/1.2.0',
      sri_hashes: JSON.stringify({ 'esm/index.mjs': 'sha384-fakeHashHooks120' }),
      status: 'published',
    },
    {
      package_id: proHooksId,
      version: '1.1.0',
      dependencies: JSON.stringify({ '@pro/utils': '^1.0.0' }),
      peer_dependencies: JSON.stringify({ vue: '>=3.4.0' }),
      cdn_path: '/@pro/hooks/1.1.0',
      sri_hashes: JSON.stringify({ 'esm/index.mjs': 'sha384-fakeHashHooks110' }),
      status: 'published',
    },
    {
      package_id: proUtilsId,
      version: '1.0.3',
      dependencies: JSON.stringify({}),
      peer_dependencies: JSON.stringify({}),
      cdn_path: '/@pro/utils/1.0.3',
      sri_hashes: JSON.stringify({ 'esm/index.mjs': 'sha384-fakeHashUtils103' }),
      status: 'published',
    },
    {
      package_id: proUtilsId,
      version: '1.0.0',
      dependencies: JSON.stringify({}),
      peer_dependencies: JSON.stringify({}),
      cdn_path: '/@pro/utils/1.0.0',
      sri_hashes: JSON.stringify({ 'esm/index.mjs': 'sha384-fakeHashUtils100' }),
      status: 'published',
    },
  ])

  // --- Apps ---
  await knex('apps').insert([
    { app_id: 'user-center', name: 'User Center', owner: 'team-a' },
    { app_id: 'data-platform', name: 'Data Platform', owner: 'team-b' },
  ])

  // --- App Version Maps ---
  await knex('app_version_maps').insert([
    {
      app_id: 'user-center',
      package_id: proTableId,
      pinned_version: '1.2.3',
      version_range: null,
      resolved_version: '1.2.3',
      updated_at: knex.fn.now(),
    },
    {
      app_id: 'user-center',
      package_id: proFormId,
      pinned_version: null,
      version_range: '^1.0.0',
      resolved_version: '1.1.2',
      updated_at: knex.fn.now(),
    },
    {
      app_id: 'data-platform',
      package_id: proTableId,
      pinned_version: null,
      version_range: '^1.2.0',
      resolved_version: '1.2.3',
      updated_at: knex.fn.now(),
    },
  ])

  // --- Grayscale Rules ---
  await knex('grayscale_rules').insert({
    app_id: 'user-center',
    package_id: proTableId,
    target_version: '2.0.0-beta.1',
    strategy: 'composite',
    rule_config: JSON.stringify({
      operator: 'OR',
      conditions: [
        { type: 'user_list', values: ['uid-alpha', 'uid-beta'] },
        {
          operator: 'AND',
          conditions: [
            { type: 'department', values: ['engineering'] },
            { type: 'percentage', value: 30, hash_key: 'user_id' },
          ],
        },
      ],
    }),
    status: 'active',
  })

  // --- Compat Results ---
  await knex('compat_results').insert([
    {
      package_id: proTableId,
      version: '1.2.3',
      vue_version: '3.5.0',
      element_plus_version: '2.9.0',
      status: 'pass',
      ci_run_url: 'https://ci.internal/runs/1001',
      tested_at: knex.fn.now(),
    },
    {
      package_id: proTableId,
      version: '1.2.3',
      vue_version: '3.4.0',
      element_plus_version: '2.9.0',
      status: 'pass',
      ci_run_url: 'https://ci.internal/runs/1002',
      tested_at: knex.fn.now(),
    },
  ])
}
