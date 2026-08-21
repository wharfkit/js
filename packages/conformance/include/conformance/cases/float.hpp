#pragma once

#include <cstdint>
#include <eosio/name.hpp>
#include <limits>
#include <string>

namespace wharfkit::cases {

// One grid entry. Operands only; results are computed on-chain by seed().
struct fp_spec
{
   uint64_t    id;
   eosio::name op;
   const char* width = "fd"; // "fs", "fd", "fq"; an empty section width resolves to fd
   std::string label;
   double      a    = 0; // fs operands are (float)a, fd operands are a; fq literal operands live in a128
   double      b    = 0;
   int64_t     i    = 0; // integer operand for from-int ops and the units operand for amt ops
   __int128    x    = 0; // 128-bit integer operand
   long double a128 = 0;
   long double b128 = 0;
   uint8_t     p    = 0; // decimal precision for the amt ops
};

// Value pool. Names are used in labels so a row is readable without the source.
constexpr double P_ZERO    = 0.0;
constexpr double P_NZERO   = -0.0;
constexpr double P_ONE     = 1.0;
constexpr double P_NONE    = -1.0;
constexpr double P_TWO     = 2.0;
constexpr double P_HALF    = 0.5;
constexpr double P_QUARTER = 0.25;
constexpr double P_FIVE    = 5.0;
constexpr double P_TEN     = 10.0;
constexpr double P_HUNDRED = 100.0;
constexpr double P_TENTH   = 0.1;
constexpr double P_FIFTH   = 0.2;
constexpr double P_THREE10 = 0.3;
constexpr double P_THIRD   = 1.0 / 3.0;
constexpr double P_2THIRD  = 2.0 / 3.0;
constexpr double P_PI      = 3.141592653589793;
constexpr double P_ONE1    = 1.1;
constexpr double P_SEVEN10 = 0.7;
constexpr double P_2P24M1  = 16777215.0;
constexpr double P_2P24    = 16777216.0;
constexpr double P_2P24P1  = 16777217.0;
constexpr double P_2P53M1  = 9007199254740991.0;
constexpr double P_2P53    = 9007199254740992.0;
constexpr double P_2P53P1  = 9007199254740993.0;
constexpr double P_2P63    = 9223372036854775808.0;
constexpr double P_2P64    = 18446744073709551616.0;
constexpr double P_1EM20   = 1e-20;
constexpr double P_1EM9    = 1e-9;
constexpr double P_1EM7    = 1e-7;
constexpr double P_1EM4    = 0.0001;
constexpr double P_1E15    = 1e15;
constexpr double P_1E17    = 1e17;
constexpr double P_VOTE    = 1.2345e17;
constexpr double P_1E20    = 1e20;
constexpr double P_1E21    = 1e21;
constexpr double P_1E22    = 1e22;
constexpr double P_ASSET   = 1234.5678;
constexpr double P_DBLMAX  = std::numeric_limits<double>::max();
constexpr double P_FLTMAX  = std::numeric_limits<float>::max();
constexpr double P_DBLMIN  = std::numeric_limits<double>::denorm_min();
constexpr double P_FLTMIN  = std::numeric_limits<float>::denorm_min();
constexpr double P_DBLNORM = std::numeric_limits<double>::min();
constexpr double P_INF     = std::numeric_limits<double>::infinity();
constexpr double P_NINF    = -std::numeric_limits<double>::infinity();
constexpr double P_NAN     = std::numeric_limits<double>::quiet_NaN();
constexpr double P_NNAN    = -std::numeric_limits<double>::quiet_NaN();

// Every double in the pool, in a fixed order, for echo rows and unary sweeps.
constexpr double      POOL[]        = {P_ZERO,   P_NZERO,   P_ONE,    P_NONE,  P_TWO,     P_HALF,   P_QUARTER, P_FIVE,
                                       P_TEN,    P_HUNDRED, P_TENTH,  P_FIFTH, P_THREE10, P_THIRD,  P_2THIRD,  P_PI,
                                       P_ONE1,   P_SEVEN10, P_2P24M1, P_2P24,  P_2P24P1,  P_2P53M1, P_2P53,    P_2P53P1,
                                       P_2P63,   P_2P64,    P_1EM20,  P_1EM9,  P_1EM7,    P_1EM4,   P_1E15,    P_1E17,
                                       P_VOTE,   P_1E20,    P_1E21,   P_1E22,  P_ASSET,   P_DBLMAX, P_FLTMAX,  P_DBLMIN,
                                       P_FLTMIN, P_DBLNORM, P_INF,    P_NINF,  P_NAN,     P_NNAN};
constexpr const char* POOL_LABELS[] = {"0",
                                       "-0",
                                       "1",
                                       "-1",
                                       "2",
                                       "0.5",
                                       "0.25",
                                       "5",
                                       "10",
                                       "100",
                                       "0.1",
                                       "0.2",
                                       "0.3",
                                       "1/3",
                                       "2/3",
                                       "pi",
                                       "1.1",
                                       "0.7",
                                       "2^24-1",
                                       "2^24",
                                       "2^24+1",
                                       "2^53-1",
                                       "2^53",
                                       "2^53+1",
                                       "2^63",
                                       "2^64",
                                       "1e-20",
                                       "1e-9",
                                       "1e-7",
                                       "1e-4",
                                       "1e15",
                                       "1e17",
                                       "1.2345e17",
                                       "1e20",
                                       "1e21",
                                       "1e22",
                                       "1234.5678",
                                       "DBL_MAX",
                                       "FLT_MAX",
                                       "DBL_TRUE_MIN",
                                       "FLT_TRUE_MIN",
                                       "DBL_MIN",
                                       "inf",
                                       "-inf",
                                       "nan",
                                       "-nan"};
constexpr uint32_t    POOL_SIZE     = sizeof(POOL) / sizeof(POOL[0]);
static_assert(sizeof(POOL_LABELS) / sizeof(POOL_LABELS[0]) == POOL_SIZE, "pool labels out of sync");

// Operand pairs for binary arithmetic. Each pair is used once per binary op per width.
struct pair_spec
{
   double      a;
   double      b;
   const char* label;
};
constexpr pair_spec PAIRS[] = {
   {P_TENTH, P_FIFTH, "0.1,0.2"},
   {P_ONE, P_THIRD, "1,1/3"},
   {P_THIRD, P_THIRD, "1/3,1/3"},
   {P_PI, P_TWO, "pi,2"},
   {P_ONE1, P_ONE1, "1.1,1.1"},
   {P_SEVEN10, P_TENTH, "0.7,0.1"},
   {P_2P53M1, P_ONE, "2^53-1,1"},
   {P_2P53, P_ONE, "2^53,1"},
   {P_2P24M1, P_ONE, "2^24-1,1"},
   {P_1E20, P_TENTH, "1e20,0.1"},
   {P_1EM20, P_1EM20, "1e-20,1e-20"},
   {P_DBLMAX, P_TWO, "DBL_MAX,2"},
   {P_FLTMAX, P_TWO, "FLT_MAX,2"},
   {P_DBLMIN, P_TWO, "DBL_TRUE_MIN,2"},
   {P_ONE, P_ZERO, "1,0"},
   {P_ZERO, P_ZERO, "0,0"},
   {P_NZERO, P_ZERO, "-0,0"},
   {P_INF, P_INF, "inf,inf"},
   {P_INF, P_NINF, "inf,-inf"},
   {P_NAN, P_ONE, "nan,1"},
   {P_ONE, P_NAN, "1,nan"},
   {P_VOTE, P_ASSET, "1.2345e17,1234.5678"},
   {P_ASSET, P_HUNDRED, "1234.5678,100"},
   {P_1E21, P_TEN, "1e21,10"},
};
constexpr uint32_t PAIRS_SIZE = sizeof(PAIRS) / sizeof(PAIRS[0]);

// Boundary to-int operands, exact in float32 and in range for every target they pair with; wasm trunc traps otherwise.
constexpr double P_2P31M128  = 2147483520.0;
constexpr double P_N2P31     = -2147483648.0;
constexpr double P_2P32M256  = 4294967040.0;
constexpr double P_2P63M2P39 = 9223371487098961920.0;

// Operands for signed 32-bit targets.
constexpr double      TOINT_SAFE[]        = {P_ZERO, P_NZERO,   P_ONE,   P_NONE, P_HALF, P_ONE1,     P_SEVEN10,
                                             P_PI,   P_HUNDRED, P_ASSET, -2.5,   2.5,    P_2P31M128, P_N2P31};
constexpr const char* TOINT_SAFE_LABELS[] = {"0",  "-0",  "1",         "-1",   "0.5", "1.1",      "0.7",
                                             "pi", "100", "1234.5678", "-2.5", "2.5", "2^31-128", "-2^31"};
constexpr uint32_t    TOINT_SAFE_SIZE     = sizeof(TOINT_SAFE) / sizeof(TOINT_SAFE[0]);
static_assert(sizeof(TOINT_SAFE_LABELS) / sizeof(TOINT_SAFE_LABELS[0]) == TOINT_SAFE_SIZE, "toint labels out of sync");

// Operands for unsigned 32-bit targets: the non-negative subset, since values at or below -1 trap on an unsigned trunc.
constexpr double      TOINT_SAFE_U[]        = {P_ZERO, P_NZERO,   P_ONE,   P_HALF, P_ONE1,    P_SEVEN10,
                                               P_PI,   P_HUNDRED, P_ASSET, 2.5,    P_2P32M256};
constexpr const char* TOINT_SAFE_U_LABELS[] = {"0",  "-0",  "1",         "0.5", "1.1",     "0.7",
                                               "pi", "100", "1234.5678", "2.5", "2^32-256"};
constexpr uint32_t    TOINT_SAFE_U_SIZE     = sizeof(TOINT_SAFE_U) / sizeof(TOINT_SAFE_U[0]);
static_assert(sizeof(TOINT_SAFE_U_LABELS) / sizeof(TOINT_SAFE_U_LABELS[0]) == TOINT_SAFE_U_SIZE,
              "toint unsigned labels out of sync");

// Extra operands appended for 64-bit and 128-bit targets.
constexpr double      TOINT_WIDE[]        = {P_2P53M1, P_2P53, P_2P53P1, P_1E15, P_1E17, P_VOTE, P_2P63M2P39};
constexpr const char* TOINT_WIDE_LABELS[] = {"2^53-1", "2^53", "2^53+1", "1e15", "1e17", "1.2345e17", "2^63-2^39"};
constexpr uint32_t    TOINT_WIDE_SIZE     = sizeof(TOINT_WIDE) / sizeof(TOINT_WIDE[0]);
static_assert(sizeof(TOINT_WIDE_LABELS) / sizeof(TOINT_WIDE_LABELS[0]) == TOINT_WIDE_SIZE,
              "toint wide labels out of sync");

constexpr int64_t     FROMINT[]        = {0,
                                          1,
                                          -1,
                                          7,
                                          -7,
                                          100,
                                          16777215,
                                          16777216,
                                          16777217,
                                          2147483647,
                                          -2147483648LL,
                                          4294967295LL,
                                          9007199254740991LL,
                                          9007199254740992LL,
                                          9007199254740993LL,
                                          INT64_MAX,
                                          INT64_MIN};
constexpr const char* FROMINT_LABELS[] = {"0",      "1",    "-1",     "7",         "-7",       "100",
                                          "2^24-1", "2^24", "2^24+1", "2^31-1",    "-2^31",    "2^32-1",
                                          "2^53-1", "2^53", "2^53+1", "INT64_MAX", "INT64_MIN"};
constexpr uint32_t    FROMINT_SIZE     = sizeof(FROMINT) / sizeof(FROMINT[0]);
static_assert(sizeof(FROMINT_LABELS) / sizeof(FROMINT_LABELS[0]) == FROMINT_SIZE, "fromint labels out of sync");

// The 32-bit from-int ops use the leading entries, which are the ones inside 32-bit range.
constexpr uint32_t FROMINT_NARROW_SIZE = 10;

constexpr __int128    FROMINT128[]        = {0,
                                             1,
                                             -1,
                                             (__int128)INT64_MAX + 1,
                                             ((__int128)1 << 100),
                                             -((__int128)1 << 100),
                                             (__int128)9007199254740993LL,
                                             ((__int128)1 << 113) + 1};
constexpr const char* FROMINT128_LABELS[] = {"0", "1", "-1", "2^63", "2^100", "-2^100", "2^53+1", "2^113+1"};
constexpr uint32_t    FROMINT128_SIZE     = sizeof(FROMINT128) / sizeof(FROMINT128[0]);
static_assert(sizeof(FROMINT128_LABELS) / sizeof(FROMINT128_LABELS[0]) == FROMINT128_SIZE,
              "fromint128 labels out of sync");

// Quad operands. A literal with the L suffix is parsed as binary128, so 0.1L differs from (long double)0.1.
constexpr long double Q_POOL[]        = {0.0L,
                                         -0.0L,
                                         1.0L,
                                         -1.0L,
                                         0.1L,
                                         (long double)0.1,
                                         1.0L / 3.0L,
                                         3.141592653589793238462643383279502884L,
                                         1e-20L,
                                         1e20L,
                                         1e21L,
                                         1e4000L,
                                         1e-4000L,
                                         123456789012345678901234567890.0L,
                                         std::numeric_limits<long double>::max(),
                                         std::numeric_limits<long double>::denorm_min(),
                                         std::numeric_limits<long double>::infinity(),
                                         -std::numeric_limits<long double>::infinity(),
                                         std::numeric_limits<long double>::quiet_NaN()};
constexpr const char* Q_POOL_LABELS[] = {
   "0",    "-0",     "1",       "-1",           "0.1L",     "(ld)0.1",       "1/3", "pi",   "1e-20", "1e20",
   "1e21", "1e4000", "1e-4000", "1.2345...e29", "LDBL_MAX", "LDBL_TRUE_MIN", "inf", "-inf", "nan"};
constexpr uint32_t Q_POOL_SIZE = sizeof(Q_POOL) / sizeof(Q_POOL[0]);
static_assert(sizeof(Q_POOL_LABELS) / sizeof(Q_POOL_LABELS[0]) == Q_POOL_SIZE, "quad pool labels out of sync");

struct qpair_spec
{
   long double a;
   long double b;
   const char* label;
};
constexpr qpair_spec Q_PAIRS[] = {
   {0.1L, 0.2L, "0.1,0.2"},
   {1.0L, 1.0L / 3.0L, "1,1/3"},
   {1e20L, 0.1L, "1e20,0.1"},
   {1e4000L, 1e4000L, "1e4000,1e4000"},
   {1.0L, 0.0L, "1,0"},
   {0.0L, 0.0L, "0,0"},
   {std::numeric_limits<long double>::infinity(), -std::numeric_limits<long double>::infinity(), "inf,-inf"},
   {std::numeric_limits<long double>::quiet_NaN(), 1.0L, "nan,1"},
   {123456789012345678901234567890.0L, 3.0L, "1.2345...e29,3"},
   {std::numeric_limits<long double>::max(), 2.0L, "LDBL_MAX,2"},
};
constexpr uint32_t Q_PAIRS_SIZE = sizeof(Q_PAIRS) / sizeof(Q_PAIRS[0]);

// Scaled-integer cases: the double amount, the integer units an asset would carry, and the precision.
struct amt_spec
{
   double      v;
   int64_t     units;
   uint8_t     precision;
   const char* label;
};
constexpr amt_spec AMT[] = {
   {1.0, 10000, 4, "1.0000"},
   {0.1, 1000, 4, "0.1000"},
   {P_ASSET, 12345678, 4, "1234.5678"},
   {0.00005, 0, 4, "0.00005 (half)"},
   {0.00015, 1, 4, "0.00015"},
   {2.675, 267, 2, "2.675"},
   {1.005, 100, 2, "1.005"},
   {P_1E15, 1000000000000000LL, 0, "1e15"},
   {123456789.123456789, 123456789123456789LL, 9, "123456789.123456789"},
   {P_1EM9, 1, 9, "1e-9"},
   {-1.5, -15, 1, "-1.5"},
   {P_2P53M1, 9007199254740991LL, 0, "2^53-1"},
};
constexpr uint32_t AMT_SIZE = sizeof(AMT) / sizeof(AMT[0]);

} // namespace wharfkit::cases
