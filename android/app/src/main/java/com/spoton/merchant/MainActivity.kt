package com.spoton.merchant

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.spoton.merchant.nav.SpotOnApp
import com.spoton.merchant.ui.theme.SpotOnTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            SpotOnTheme { SpotOnApp() }
        }
    }
}
