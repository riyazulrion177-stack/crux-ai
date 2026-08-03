-- ============================================================
-- CRUX LIFE OS - MONETIZATION ARCHITECTURE SUPABASE DDL SCHEMA
-- Schema Only. Do NOT migrate automatically.
-- ============================================================

-- 1. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan VARCHAR(32) NOT NULL DEFAULT 'FREE', -- FREE, PRO, ELITE, LIFETIME, FOUNDER
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, TRIALING, PAST_DUE, CANCELLED, EXPIRED
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    renewal_date TIMESTAMPTZ,
    trial_end_date TIMESTAMPTZ,
    is_lifetime BOOLEAN NOT NULL DEFAULT FALSE,
    is_founder BOOLEAN NOT NULL DEFAULT FALSE,
    is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    provider VARCHAR(32) NOT NULL DEFAULT 'MANUAL', -- STRIPE, PADDLE, GOOGLE_PLAY, APPLE_IAP, MANUAL
    provider_subscription_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PURCHASES TABLE
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan VARCHAR(32),
    item_id TEXT,
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    provider VARCHAR(32) NOT NULL,
    provider_payment_id TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED', -- PENDING, COMPLETED, FAILED, REFUNDED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_key TEXT NOT NULL,
    item_name TEXT NOT NULL,
    category VARCHAR(32) NOT NULL, -- THEME, BADGE, FRAME, AURA, TITLE, WEAPON_SKIN, PET, ANIMATION, CONSUMABLE
    rarity VARCHAR(16) NOT NULL DEFAULT 'COMMON',
    is_equipped BOOLEAN NOT NULL DEFAULT FALSE,
    is_consumable BOOLEAN NOT NULL DEFAULT FALSE,
    quantity INTEGER DEFAULT 1,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, item_key)
);

-- 4. MARKETPLACE TABLE
CREATE TABLE IF NOT EXISTS public.marketplace (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(32) NOT NULL, -- TEMPLATES, STUDY_PLANS, WORKOUT_PACKS, HABIT_PACKS, FOCUS_PACKS
    author_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    sales_count INTEGER DEFAULT 0,
    price_coins INTEGER NOT NULL DEFAULT 0,
    price_usd NUMERIC(10, 2),
    tags TEXT[] DEFAULT '{}',
    preview_details TEXT[] DEFAULT '{}',
    content_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. BATTLE PASS TABLE
CREATE TABLE IF NOT EXISTS public.battle_pass (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    season_id TEXT NOT NULL,
    current_tier INTEGER NOT NULL DEFAULT 1,
    current_xp INTEGER NOT NULL DEFAULT 0,
    has_premium_pass BOOLEAN NOT NULL DEFAULT FALSE,
    claimed_free_tiers INTEGER[] DEFAULT '{}',
    claimed_premium_tiers INTEGER[] DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, season_id)
);

-- 6. REWARD HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.reward_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_type VARCHAR(32) NOT NULL, -- COINS, XP, ENERGY, RETRY_BOSS, TREASURE_CHEST, AI_MESSAGES, PREMIUM_TRIAL_TICKET
    amount INTEGER NOT NULL,
    source TEXT NOT NULL, -- REWARDED_AD, BATTLE_PASS, QUEST, PROMOTION
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. COIN TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Positive for earned, negative for spent
    type VARCHAR(16) NOT NULL, -- EARNED, PURCHASED, SPENT, REWARDED
    source TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. FEATURE UNLOCKS TABLE
CREATE TABLE IF NOT EXISTS public.feature_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_key VARCHAR(64) NOT NULL,
    unlocked_via VARCHAR(32) NOT NULL, -- PLAN, TRIAL_TICKET, ADMIN_GRANT
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, feature_key)
);

-- 9. PRICING TABLE
CREATE TABLE IF NOT EXISTS public.pricing (
    id VARCHAR(32) PRIMARY KEY,
    plan VARCHAR(32) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    tagline TEXT,
    price_monthly INTEGER NOT NULL,
    price_yearly INTEGER NOT NULL,
    price_lifetime INTEGER,
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    features VARCHAR(64)[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_pass ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_unlocks ENABLE ROW LEVEL SECURITY;

-- Default user isolation policy
CREATE POLICY "Users view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own inventory" ON public.inventory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own battle pass" ON public.battle_pass FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own coin transactions" ON public.coin_transactions FOR ALL USING (auth.uid() = user_id);
